// WARNING: This file is deprecated. Economy data is now stored in SQLite (see src/db/database.ts).
// All functions here are wrappers or stubs for backward compatibility during migration.

import { getBalance as dbGetBalance, addBalance as dbAddBalance, subtractBalance as dbSubtractBalance, setBalance as dbSetBalance, getTopBalances as dbGetTopBalances } from '../db/database';

// Remove all JSON logic. Only export wrappers for compatibility.

export function getBalance(userId: string): number {
  return dbGetBalance(userId);
}

export function addBalance(userId: string, amount: number) {
  dbAddBalance(userId, amount);
}

export function subtractBalance(userId: string, amount: number) {
  dbSubtractBalance(userId, amount);
}

export function setBalance(userId: string, amount: number) {
  dbSetBalance(userId, amount);
}

export function getTopBalances(limit = 10): [string, number][] {
  // Convert SQLite result to legacy format
  return dbGetTopBalances(limit).map((row: { user_id: string, balance: number }) => [row.user_id, row.balance]);
}

// Wrappers for lastDaily and bank (using direct SQLite access)
import { db } from '../db/database';

export function getLastDaily(userId: string): number {
  const row = db.prepare('SELECT last_daily FROM economy WHERE user_id = ?').get(userId) as { last_daily?: number } | undefined;
  return row && typeof row.last_daily === 'number' ? row.last_daily : 0;
}

export function setLastDaily(userId: string, timestamp: number) {
  db.prepare('INSERT INTO economy (user_id, last_daily) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET last_daily=excluded.last_daily').run(userId, timestamp);
}

export function getBank(userId: string) {
  const row = db.prepare('SELECT bank FROM economy WHERE user_id = ?').get(userId) as { bank?: number } | undefined;
  return { amount: row && typeof row.bank === 'number' ? row.bank : 0, lastInterest: 0 };
}

export function setBank(userId: string, amount: number, lastInterest: number) {
  db.prepare('INSERT INTO economy (user_id, bank) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET bank=excluded.bank').run(userId, amount);
}

// TODO: Implement wrappers for getLastDaily, setLastDaily, getBank, setBank, getTopBalances using SQLite.
// TODO: Remove this file after migration is complete. 