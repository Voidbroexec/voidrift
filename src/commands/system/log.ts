import { Command } from '../../types/command';
import fs from 'fs';
import path from 'path';
import { config } from '../../config';
import { CommandExecuteOptions } from '../../types/command';
import { GuildMember } from 'discord.js';

const LOG_FILE = path.join(__dirname, '../../../logs/voidrift.log');
const BANNER_LINES = 13; // Number of lines in the ASCII banner
const MAX_MSG_LEN = 2000;
const MAX_LOG_MSGS = 5;

function hasLogPermission(member?: GuildMember | null): boolean {
  if (!member) return false;
  const adminRole = config.adminRole || process.env.ADMIN_ROLE;
  if (adminRole && member.roles.cache.has(adminRole)) return true;
  if (config.adminIds.includes(member.id)) return true;
  if (process.env.OWNER_ID && member.id === process.env.OWNER_ID) return true;
  return member.permissions.has('Administrator');
}

function chunkString(str: string, size: number): string[] {
  const chunks = [];
  for (let i = 0; i < str.length; i += size) {
    chunks.push(str.slice(i, i + size));
  }
  return chunks;
}

const logCommand: Command = {
  options: {
    name: 'log',
    description: 'Show the bot ASCII banner and the last 50 lines of the log file.',
    usage: 'log',
    category: 'system',
  },
  async execute({ message }: CommandExecuteOptions): Promise<void> {
    if (!message) return;
    if (!hasLogPermission(message.member)) {
      await message.reply('You do not have permission to use this command.');
      return;
    }
    if (!fs.existsSync(LOG_FILE)) {
      await message.reply('No log file found.');
      return;
    }
    const logContent = fs.readFileSync(LOG_FILE, 'utf8');
    const lines = logContent.split(/\r?\n/);
    const banner = lines.slice(0, BANNER_LINES).join('\n');
    const lastLines = lines.slice(-50).join('\n');
    // Send banner (truncate if needed)
    let bannerMsg = '```' + banner + '```';
    if (bannerMsg.length > MAX_MSG_LEN) {
      bannerMsg = bannerMsg.slice(0, MAX_MSG_LEN - 3) + '...';
    }
    if (
      message.channel &&
      'send' in message.channel &&
      typeof message.channel.send === 'function'
    ) {
      await message.channel.send({ content: bannerMsg });
      // Split log output into chunks
      const logChunks = chunkString('```' + lastLines + '```', MAX_MSG_LEN);
      for (let i = 0; i < Math.min(logChunks.length, MAX_LOG_MSGS); i++) {
        await message.channel.send({ content: logChunks[i] });
      }
      if (logChunks.length > MAX_LOG_MSGS) {
        await message.channel.send({ content: `...truncated. Showing last ${(MAX_MSG_LEN * MAX_LOG_MSGS)} characters of logs.` });
      }
    } else {
      await message.reply('Cannot send logs in this channel type.');
    }
  },
};

export = logCommand; 