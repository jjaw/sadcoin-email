import Database from 'better-sqlite3';
import path from 'path';
import {
  createWalletClient,
  http,
  parseEther,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import {
  ConversionContract_ABI,
  SEPOLIA_CONTRACTS,
  SADCoin_ABI,
} from '@/lib/contracts';

// Use a persistent file in the project root
const db = new Database(path.resolve(process.cwd(), 'faucet-claims.db'));

// Ensure claims table exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT UNIQUE NOT NULL,
    claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// Env vars
const PRIVATE_KEY = process.env.FAUCET_PRIVATE_KEY as string;
const CHAINSTACK_RPC_URL = process.env.CHAINSTACK_RPC_URL;
if (!PRIVATE_KEY) throw new Error('[Faucet] Missing FAUCET_PRIVATE_KEY');
if (!/^0x[a-fA-F0-9]{64}$/.test(PRIVATE_KEY))
  throw new Error('[Faucet] FAUCET_PRIVATE_KEY must be 0x-prefixed 64 hex chars');
if (!CHAINSTACK_RPC_URL) throw new Error('[Faucet] Missing CHAINSTACK_RPC_URL');

const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(CHAINSTACK_RPC_URL),
});

// POST: send 1 SAD token, record claim
export async function POST(req: Request) {
  let address: string;
  try {
    ({ address } = await req.json());
  } catch (err) {
    console.error('[Faucet] Invalid JSON:', err);
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
  }

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    console.warn('[Faucet] Invalid address:', address);
    return new Response(JSON.stringify({ error: 'Invalid address' }), { status: 400 });
  }

  // Already claimed?
  try {
    const existing = db.prepare('SELECT 1 FROM claims WHERE address = ?').get(address.toLowerCase());
    if (existing) {
      console.info('[Faucet] Already claimed:', address);
      return new Response(JSON.stringify({ error: 'Already claimed' }), { status: 403 });
    }
  } catch (err) {
    console.error('[Faucet] DB check error:', err);
    return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
  }

  // Send 1 SAD
  let tokenTxHash: string;
  try {
    tokenTxHash = await walletClient.writeContract({
      address: SEPOLIA_CONTRACTS.SADCoin,
      abi: SADCoin_ABI,
      functionName: 'transfer',
      args: [address as `0x${string}`, parseEther('1')],
    });
    console.info(`[Faucet] Sent 1 SAD to ${address}. Tx: ${tokenTxHash}`);
  } catch (err: any) {
    console.error('[Faucet] Error sending SAD:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to send SAD token' }),
      { status: 500 }
    );
  }

  // Record claim
  try {
    db.prepare('INSERT INTO claims (address) VALUES (?)').run(address.toLowerCase());
    console.info(`[Faucet] Claim recorded: ${address}`);
  } catch (err) {
    console.error('[Faucet] DB record error:', err);
  }

  return new Response(JSON.stringify({ success: true, tokenTxHash }), { status: 200 });
}

// GET: check if claimed
export async function GET(req: Request) {
  const url = new URL(req.url);
  const address = url.searchParams.get('address');
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return new Response(JSON.stringify({ error: 'Invalid address' }), { status: 400 });
  }
  const existing = db
    .prepare('SELECT 1 FROM claims WHERE address = ?')
    .get(address.toLowerCase());
  return new Response(JSON.stringify({ claimed: !!existing }), { status: 200 });
}
