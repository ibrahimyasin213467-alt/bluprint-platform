import { Connection } from '@solana/web3.js';

const RPC_ENDPOINTS = [
  process.env.RPC_URL_1 || 'https://api.mainnet-beta.solana.com',
  process.env.RPC_URL_2 || 'https://solana-api.projectserum.com',
  process.env.RPC_URL_3 || 'https://rpc.ankr.com/solana',
];

let currentRpcIndex = 0;

function getNextRpc(): string {
  currentRpcIndex = (currentRpcIndex + 1) % RPC_ENDPOINTS.length;
  return RPC_ENDPOINTS[currentRpcIndex];
}

export async function getConnectionWithFallback(): Promise<Connection> {
  const errors: Error[] = [];
  
  for (let i = 0; i < RPC_ENDPOINTS.length; i++) {
    const endpoint = getNextRpc();
    try {
      const connection = new Connection(endpoint, 'confirmed');
      // Test connection
      await Promise.race([
        connection.getSlot(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
      ]);
      return connection;
    } catch (error) {
      errors.push(error as Error);
      console.warn(`RPC ${endpoint} failed:`, error);
    }
  }
  
  throw new Error(`All RPC endpoints failed: ${errors.map(e => e.message).join(', ')}`);
}