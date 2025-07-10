export interface AFKStatus {
  reason: string;
  since: number;
}

const afkMap: Record<string, AFKStatus> = {};

export function setAFK(userId: string, reason: string) {
  afkMap[userId] = { reason, since: Date.now() };
}

export function clearAFK(userId: string) {
  delete afkMap[userId];
}

export function getAFK(userId: string): AFKStatus | undefined {
  return afkMap[userId];
}

export function isAFK(userId: string): boolean {
  return !!afkMap[userId];
}

export function getAllAFK(): Record<string, AFKStatus> {
  return afkMap;
} 