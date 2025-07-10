const lastXpTimestamps: Record<string, number> = {};

export function canGainXp(userId: string, cooldownMs = 60000): boolean {
  const now = Date.now();
  if (!lastXpTimestamps[userId] || now - lastXpTimestamps[userId] > cooldownMs) {
    lastXpTimestamps[userId] = now;
    return true;
  }
  return false;
} 