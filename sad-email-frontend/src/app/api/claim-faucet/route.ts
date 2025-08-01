import { Redis } from '@upstash/redis';
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

// Initialize Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

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
    const existing = await redis.get(`faucet_claim:${address.toLowerCase()}`);
    if (existing) {
      console.info('[Faucet] Already claimed:', address);
      return new Response(JSON.stringify({ error: 'Already claimed' }), { status: 403 });
    }
  } catch (err) {
    console.error('[Faucet] Redis check error:', err);
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
    await redis.set(`faucet_claim:${address.toLowerCase()}`, {
      address: address.toLowerCase(),
      claimed_at: new Date().toISOString(),
      txHash: tokenTxHash
    });
    console.info(`[Faucet] Claim recorded: ${address}`);
  } catch (err) {
    console.error('[Faucet] Redis record error:', err);
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
  
  try {
    const existing = await redis.get(`faucet_claim:${address.toLowerCase()}`);
    return new Response(JSON.stringify({ claimed: !!existing }), { status: 200 });
  } catch (err) {
    console.error('[Faucet] Redis GET error:', err);
    return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
  }
}
