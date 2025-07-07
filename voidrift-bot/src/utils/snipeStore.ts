export interface SnipedMessage {
  content: string;
  author: string;
  channelId: string;
  timestamp: number;
}

const snipes: Record<string, SnipedMessage[]> = {};

export function addSnipe(channelId: string, content: string, author: string): void {
  if (!snipes[channelId]) snipes[channelId] = [];
  snipes[channelId].push({ content, author, channelId, timestamp: Date.now() });
  if (snipes[channelId].length > 5) snipes[channelId].shift();
}

export function getSnipes(channelId: string): SnipedMessage[] {
  return snipes[channelId] ?? [];
}
