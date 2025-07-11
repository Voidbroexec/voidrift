
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

// send it to AI to explain bro sorry i just coded without thinking

const LOG_DIR = path.join(__dirname, '../../logs');
const LOG_FILE = path.join(LOG_DIR, 'voidrift.log');

// Log rotation: archive if >50MB or older than 30 days
function rotateLogIfNeeded() {
  if (!fs.existsSync(LOG_FILE)) return;
  const stats = fs.statSync(LOG_FILE);
  const now = Date.now();
  const maxSize = 50 * 1024 * 1024; // 50MB
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  const created = stats.birthtimeMs || stats.ctimeMs;
  if (stats.size > maxSize || (now - created) > maxAge) {
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    const archive = path.join(LOG_DIR, `voidrift-${date}.log`);
    fs.renameSync(LOG_FILE, archive);
  }
}

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
  rotateLogIfNeeded();
}

function appendLog(message: string) {
  ensureLogDir();
  fs.appendFileSync(LOG_FILE, message + '\n', { encoding: 'utf8' });
}

/**
 * Send a log message to the Discord log channel.
 * @param client The Discord client instance
 * @param content The log message content
 * @param embed Optional embed to send
 */
export async function sendLogToChannel(client: any, content: string, embed?: any) {
  // Use LOG_CHANNEL_ID from config or environment
  const logChannelId = process.env.LOG_CHANNEL_ID || (client.config && client.config.logChannelId);
  if (!logChannelId) {
    console.warn('[Logger] LOG_CHANNEL_ID not set in environment or config.');
    return;
  }
  const channel = client.channels.cache.get(logChannelId);
  if (!channel || !('send' in channel)) {
    console.warn(`[Logger] Log channel not found: ${logChannelId}`);
    return;
  }
  try {
    if (embed) {
      await channel.send({ content, embeds: [embed] });
    } else {
      await channel.send({ content });
    }
  } catch (err) {
    console.error('[Logger] Failed to send log to channel:', err);
  }
}

/**
 * Backup the SQLite DB and logs to /backup with a timestamp.
 */
export function backupDatabaseAndLogs() {
  const backupDir = path.join(__dirname, '../../backup');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  const date = new Date().toISOString().replace(/[:.]/g, '-');
  // Copy DB
  const dbSrc = path.join(__dirname, '../../data/voidrift.sqlite');
  const dbDest = path.join(backupDir, `voidrift-${date}.sqlite`);
  if (fs.existsSync(dbSrc)) fs.copyFileSync(dbSrc, dbDest);
  // Copy log
  const logSrc = path.join(__dirname, '../../logs/voidrift.log');
  const logDest = path.join(backupDir, `voidrift-${date}.log`);
  if (fs.existsSync(logSrc)) fs.copyFileSync(logSrc, logDest);
}

export class Logger {
  private static getTimestamp(): string {
    return new Date().toLocaleString();
  }

  static info(message: string): void {
    const logMsg = `[${this.getTimestamp()}] [INFO] ${message}`;
    console.log(chalk.blue(logMsg));
    appendLog(logMsg);
  }

  static success(message: string): void {
    const logMsg = `[${this.getTimestamp()}] [SUCCESS] ${message}`;
    console.log(chalk.green(logMsg));
    appendLog(logMsg);
  }

  static warn(message: string): void {
    const logMsg = `[${this.getTimestamp()}] [WARN] ${message}`;
    console.log(chalk.yellow(logMsg));
    appendLog(logMsg);
  }

  static error(message: string): void {
    const logMsg = `[${this.getTimestamp()}] [ERROR] ${message}`;
    console.log(chalk.red(logMsg));
    appendLog(logMsg);
  }

  static debug(message: string): void {
    if (process.env.NODE_ENV === 'development') {
      const logMsg = `[${this.getTimestamp()}] [DEBUG] ${message}`;
      console.log(chalk.gray(logMsg));
      appendLog(logMsg);
    }
  }

  static command(user: string, command: string, guild?: string): void {
    const location = guild ? `in ${guild}` : 'in DMs';
    const logMsg = `[${this.getTimestamp()}] [COMMAND] ${user} used ${command} ${location}`;
    console.log(chalk.cyan(logMsg));
    appendLog(logMsg);
  }

  static banner(ascii: string): void {
    // For logging the ASCII banner at startup
    appendLog(ascii);
  }
}