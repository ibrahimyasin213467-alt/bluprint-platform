interface AbuseEntry {
  count: number;
  blockUntil: number;
}

const ipCreateCount = new Map<string, AbuseEntry>();

export function checkAbuse(ip: string): { allowed: boolean; blockUntil?: number } {
  const now = Date.now();
  const entry = ipCreateCount.get(ip);
  
  if (entry) {
    if (now < entry.blockUntil) {
      return { allowed: false, blockUntil: entry.blockUntil };
    }
    if (now > entry.blockUntil + 5 * 60 * 1000) {
      // 5 dakika sonra sıfırla
      ipCreateCount.delete(ip);
      return { allowed: true };
    }
  }
  
  return { allowed: true };
}

export function recordCreateAttempt(ip: string): void {
  const now = Date.now();
  const entry = ipCreateCount.get(ip);
  
  if (entry) {
    entry.count++;
    if (entry.count > 3) {
      entry.blockUntil = now + 5 * 60 * 1000; // 5 dakika blok
    }
    ipCreateCount.set(ip, entry);
  } else {
    ipCreateCount.set(ip, { count: 1, blockUntil: 0 });
  }
}