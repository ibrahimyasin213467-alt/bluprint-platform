import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'token-creations.jsonl');

// Log dizinini oluştur
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export interface TokenCreationLog {
  timestamp: string;
  wallet: string;
  success: boolean;
  reason?: string;
  mintAddress?: string;
  ip?: string;
}

export function logTokenCreation(log: TokenCreationLog): void {
  const logLine = JSON.stringify(log) + '\n';
  fs.appendFileSync(LOG_FILE, logLine, 'utf-8');
}