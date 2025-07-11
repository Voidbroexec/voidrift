import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure the data directory exists
const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Path to the SQLite database file
const DB_PATH = path.join(DATA_DIR, 'voidrift.sqlite');

// Open the SQLite database (will create if it doesn't exist)
export const db: typeof Database.prototype = new Database(DB_PATH);

// --- Table Initialization ---
// Users table: stores basic user info
// Economy table: stores balances, bank, last daily, etc.
// Quests table: stores quest progress per user
// Bans table: stores ban records

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  username TEXT,
  joined_at INTEGER
);

CREATE TABLE IF NOT EXISTS economy (
  user_id TEXT PRIMARY KEY,
  balance INTEGER DEFAULT 0,
  bank INTEGER DEFAULT 0,
  last_daily INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quests (
  user_id TEXT,
  quest_name TEXT,
  progress INTEGER DEFAULT 0,
  updated_at INTEGER,
  PRIMARY KEY (user_id, quest_name)
);

CREATE TABLE IF NOT EXISTS bans (
  user_id TEXT PRIMARY KEY,
  reason TEXT,
  moderator TEXT,
  banned_at INTEGER
);

-- Reminders table: stores user reminders
CREATE TABLE IF NOT EXISTS reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  reminder TEXT,
  remind_at INTEGER
);

-- Tickets table: stores support/help tickets
CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  channel_id TEXT,
  reason TEXT,
  status TEXT,
  created_at INTEGER,
  closed_at INTEGER
);

-- Lottery tickets table: stores user lottery ticket purchases
CREATE TABLE IF NOT EXISTS lottery_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  draw_id INTEGER,
  ticket_count INTEGER,
  purchased_at INTEGER
);

-- Reaction roles table: maps messages to roles/emojis
CREATE TABLE IF NOT EXISTS reaction_roles (
  message_id TEXT PRIMARY KEY,
  channel_id TEXT,
  emoji TEXT,
  role_id TEXT
);

-- Server stats table: stores tracked server statistics
CREATE TABLE IF NOT EXISTS server_stats (
  guild_id TEXT PRIMARY KEY,
  stat_key TEXT,
  stat_value INTEGER
);

-- Escrows table: holds funds temporarily for trades, bets, etc.
CREATE TABLE IF NOT EXISTS escrows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  amount INTEGER,
  reason TEXT,
  status TEXT, -- 'pending', 'released', 'cancelled'
  created_at INTEGER,
  released_at INTEGER
);
`);

// Add XP and level columns to users table if not present (migration)
try {
  db.prepare('ALTER TABLE users ADD COLUMN xp INTEGER DEFAULT 0').run();
} catch {}
try {
  db.prepare('ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1').run();
} catch {}

// --- Helper Functions ---

/**
 * Add or update a user in the users table.
 */
export function upsertUser(userId: string, username: string, joinedAt: number) {
  db.prepare(`INSERT INTO users (user_id, username, joined_at) VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET username=excluded.username, joined_at=excluded.joined_at`).run(userId, username, joinedAt);
}

/**
 * Get or create a user's economy record.
 */
export function getOrCreateEconomy(userId: string) {
  let row = db.prepare('SELECT * FROM economy WHERE user_id = ?').get(userId);
  if (!row) {
    db.prepare('INSERT INTO economy (user_id) VALUES (?)').run(userId);
    row = db.prepare('SELECT * FROM economy WHERE user_id = ?').get(userId);
  }
  return row;
}

/**
 * Update a user's balance.
 */
export function setBalance(userId: string, balance: number) {
  db.prepare(`INSERT INTO economy (user_id, balance) VALUES (?, ?)
    ON CONFLICT(user_id) DO UPDATE SET balance=excluded.balance`).run(userId, balance);
}

/**yes
 * Add to a user's balance.
 */
export function addBalance(userId: string, amount: number) {
  db.prepare('UPDATE economy SET balance = balance + ? WHERE user_id = ?').run(amount, userId);
}

/**
 * Subtract from a user's balance (never below zero).
 */
export function subtractBalance(userId: string, amount: number) {
  db.prepare('UPDATE economy SET balance = MAX(0, balance - ?) WHERE user_id = ?').run(amount, userId);
}

/**
 * Get a user's balance.
 */
export function getBalance(userId: string): number {
  const row = db.prepare('SELECT balance FROM economy WHERE user_id = ?').get(userId) as { balance?: number } | undefined;
  return row && typeof row.balance === 'number' ? row.balance : 0;
}

/**
 * Get top N balances for leaderboard.
 */
export function getTopBalances(limit = 10): { user_id: string, balance: number }[] {
  return db.prepare('SELECT user_id, balance FROM economy ORDER BY balance DESC LIMIT ?').all(limit) as { user_id: string; balance: number }[];
}

/**
 * Move funds from user's balance to escrow.
 */
export function moveToEscrow(userId: string, amount: number, reason: string) {
  const balance = getBalance(userId);
  if (balance < amount) throw new Error('Insufficient funds');
  subtractBalance(userId, amount);
  db.prepare('INSERT INTO escrows (user_id, amount, reason, status, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(userId, amount, reason, 'pending', Date.now());
  logDbOperation('moveToEscrow', { userId, amount, reason });
}

/**
 * Release escrowed funds back to user's balance.
 */
export function releaseEscrow(escrowId: number) {
  const escrow = db.prepare('SELECT * FROM escrows WHERE id = ? AND status = ?').get(escrowId, 'pending') as any;
  if (!escrow) throw new Error('Escrow not found or already released');
  addBalance(escrow.user_id, escrow.amount);
  db.prepare('UPDATE escrows SET status = ?, released_at = ? WHERE id = ?')
    .run('released', Date.now(), escrowId);
  logDbOperation('releaseEscrow', { escrowId, userId: escrow.user_id, amount: escrow.amount });
}

/**
 * Cancel escrow and refund user.
 */
export function cancelEscrow(escrowId: number) {
  const escrow = db.prepare('SELECT * FROM escrows WHERE id = ? AND status = ?').get(escrowId, 'pending') as any;
  if (!escrow) throw new Error('Escrow not found or already released');
  addBalance(escrow.user_id, escrow.amount);
  db.prepare('UPDATE escrows SET status = ?, released_at = ? WHERE id = ?')
    .run('cancelled', Date.now(), escrowId);
  logDbOperation('cancelEscrow', { escrowId, userId: escrow.user_id, amount: escrow.amount });
}

/**
 * Get all pending escrows for a user.
 */
export function getUserEscrows(userId: string) {
  return db.prepare('SELECT * FROM escrows WHERE user_id = ? AND status = ?').all(userId, 'pending') as any[];
}

// XP/Level helper functions
export function getXp(userId: string): number {
  const row = db.prepare('SELECT xp FROM users WHERE user_id = ?').get(userId) as { xp?: number } | undefined;
  return row && typeof row.xp === 'number' ? row.xp : 0;
}

export function getLevel(userId: string): number {
  const row = db.prepare('SELECT level FROM users WHERE user_id = ?').get(userId) as { level?: number } | undefined;
  return row && typeof row.level === 'number' ? row.level : 1;
}

export function addXp(userId: string, amount: number): void {
  db.prepare('UPDATE users SET xp = xp + ? WHERE user_id = ?').run(amount, userId);
}

export function setLevel(userId: string, level: number): void {
  db.prepare('UPDATE users SET level = ? WHERE user_id = ?').run(level, userId);
}

export function getTopXp(limit = 10): { user_id: string, xp: number, level: number }[] {
  return db.prepare('SELECT user_id, xp, level FROM users ORDER BY xp DESC LIMIT ?').all(limit) as any[];
}

// Add similar helpers for quests, bans, etc. as needed.

// --- Logging ---
// All DB operations are logged for audit/debugging
function logDbOperation(op: string, details: any) {
  // You can expand this to write to a file or external logger
  console.log(`[DB] ${op}:`, details);
}

// Example usage of logging in a helper:
// logDbOperation('setBalance', { userId, balance }); 