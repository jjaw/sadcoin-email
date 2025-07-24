import Database from 'better-sqlite3';
import path from 'path';
import { createWalletClient, http, parseEther, createPublicClient, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { ConversionContract_ABI, SEPOLIA_CONTRACTS, SADCoin_ABI } from '@/lib/contracts';

// Use a persistent file in the project root
const db = new Database(path.resolve(process.cwd(), 'faucet-claims.db'));

// Create table if not exists
try {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      address TEXT UNIQUE NOT NULL,
      claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
} catch (err) {
  console.error('[Faucet] Failed to initialize SQLite DB:', err);
  throw err;
}

// Validate required environment variables
const PRIVATE_KEY = process.env.FAUCET_PRIVATE_KEY as string;
const CHAINSTACK_RPC_URL = process.env.CHAINSTACK_RPC_URL;
if (!PRIVATE_KEY) {
  console.error('[Faucet] Missing FAUCET_PRIVATE_KEY env var');
  throw new Error('Missing FAUCET_PRIVATE_KEY env var');
}
if (!/^0x[a-fA-F0-9]{64}$/.test(PRIVATE_KEY)) {
  console.error('[Faucet] FAUCET_PRIVATE_KEY must be a 0x-prefixed 64-character hex string');
  throw new Error('Invalid FAUCET_PRIVATE_KEY format');
}
if (!CHAINSTACK_RPC_URL) {
  console.error('[Faucet] Missing CHAINSTACK_RPC_URL env var');
  throw new Error('Missing CHAINSTACK_RPC_URL env var');
}

const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(CHAINSTACK_RPC_URL)
});
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(CHAINSTACK_RPC_URL),
});

export async function POST(req: Request) {
  let address: string | undefined;
  try {
    const body = await req.json();
    address = body.address;
  } catch (err) {
    console.error('[Faucet] Invalid JSON in request:', err);
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
  }

  // Basic address validation
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    console.warn(`[Faucet] Invalid address: ${address}`);
    return new Response(JSON.stringify({ error: 'Invalid address' }), { status: 400 });
  }

  // Check if already claimed
  try {
    const existing = db.prepare('SELECT * FROM claims WHERE address = ?').get(address.toLowerCase());
    if (existing) {
      console.info(`[Faucet] Address already claimed: ${address}`);
      return new Response(JSON.stringify({ error: 'Address has already claimed' }), { status: 403 });
    }
  } catch (err) {
    console.error('[Faucet] SQLite error during claim check:', err);
    return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
  }

  // Step 1: Send ~0.009 ETH to user to fund their first SADCoin purchase
  let fundingTxHash: string | undefined;
  try {
    fundingTxHash = await walletClient.sendTransaction({
      to: address,
      value: parseEther('0.009'), // 0.007 ETH for purchase + 0.002 for gas buffer
    });
    console.info(`[Faucet] Sent 0.009 ETH to ${address}. Tx: ${fundingTxHash}`);
  } catch (err) {
    console.error(`[Faucet] Error sending ETH to ${address}:`, err);
    return new Response(JSON.stringify({ error: 'Failed to fund user wallet' }), { status: 500 });
  }

  // Step 2: Record claim in SQLite
  try {
    db.prepare('INSERT INTO claims (address) VALUES (?)').run(address.toLowerCase());
    console.info(`[Faucet] Claim recorded for ${address} at ${new Date().toISOString()}`);
  } catch (err) {
    console.error(`[Faucet] SQLite error recording claim for ${address}:`, err);
  }

  // Step 3: Return fundingTxHash to frontend
  return new Response(JSON.stringify({ success: true, fundingTxHash }), { status: 200 });
}

// GET endpoint to check claim status
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return new Response(JSON.stringify({ error: 'Invalid address' }), { status: 400 });
  }
  const existing = db.prepare('SELECT * FROM claims WHERE address = ?').get(address.toLowerCase());
  return new Response(JSON.stringify({ claimed: !!existing }), { status: 200 });
}
