export interface PresenceRecord {
  status: string;
  timestamp: number;
}

const history: PresenceRecord[] = [];

export function logPresence(status: string): void {
  history.push({ status, timestamp: Date.now() });
  if (history.length > 100) history.shift();
}

export function getPresenceHistory(): PresenceRecord[] {
  return [...history];
}
