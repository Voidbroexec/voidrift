import { getXp as dbGetXp, getLevel as dbGetLevel, addXp as dbAddXp, setLevel as dbSetLevel, getTopXp as dbGetTopXp } from '../db/database';
import { Logger } from './logger';

export function getXp(userId: string): number {
  return dbGetXp(userId);
}

export function getLevel(userId: string): number {
  return dbGetLevel(userId);
}

export function addXp(userId: string, amount: number): void {
  dbAddXp(userId, amount);
  Logger.info(`User ${userId} gained ${amount} XP`);
}

export function setLevel(userId: string, level: number): void {
  dbSetLevel(userId, level);
  Logger.info(`User ${userId} set to level ${level}`);
}

export function getTopXp(limit = 10): { user_id: string, xp: number, level: number }[] {
  return dbGetTopXp(limit);
} 