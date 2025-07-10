import { Command } from '../../types/command';
import fs from 'fs';
import path from 'path';
import { config } from '../../config';
import { CommandExecuteOptions } from '../../types/command';
import { GuildMember } from 'discord.js';
import { AttachmentBuilder } from 'discord.js';

const LOG_FILE = path.join(__dirname, '../../../logs/voidrift.log');
const BANNER_LINES = 13;

function hasLogPermission(member?: GuildMember | null): boolean {
  if (!member) return false;
  const adminRole = config.adminRole || process.env.ADMIN_ROLE;
  if (adminRole && member.roles.cache.has(adminRole)) return true;
  if (config.adminIds.includes(member.id)) return true;
  if (process.env.OWNER_ID && member.id === process.env.OWNER_ID) return true;
  return member.permissions.has('Administrator');
}

const debugCommand: Command = {
  options: {
    name: 'debug',
    description: 'Show the ASCII banner and log lines. Usage: debug log [all|N]',
    usage: 'debug log [all|N]',
    category: 'system',
  },
  async execute({ message, args }: CommandExecuteOptions): Promise<void> {
    if (!message || !args || args.length === 0) {
      await message?.reply('Usage: debug log [all|N]');
      return;
    }
    if (!hasLogPermission(message.member)) {
      await message.reply('You do not have permission to use this command.');
      return;
    }
    const sub = args[0].toLowerCase();
    if (sub !== 'log') {
      await message.reply('Usage: debug log [all|N]');
      return;
    }
    if (!fs.existsSync(LOG_FILE)) {
      await message.reply('No log file found.');
      return;
    }
    const logContent = fs.readFileSync(LOG_FILE, 'utf8');
    const lines = logContent.split(/\r?\n/);
    const banner = lines.slice(0, BANNER_LINES).join('\n');
    let outputLines: string[] = [];
    if (args[1] === 'all') {
      outputLines = lines;
    } else if (args[1] && !isNaN(Number(args[1]))) {
      outputLines = lines.slice(0, Number(args[1]));
    } else {
      outputLines = lines.slice(-50); // default last 50 lines
    }
    const outputText = outputLines.join('\n');
    if (outputText.length > 1900) {
      // Send as file if too long
      const file = new AttachmentBuilder(Buffer.from(outputText, 'utf8'), { name: 'debug-log.txt' });
      await message.reply({ content: 'Log output is too long, sending as file:', files: [file] });
    } else {
      await message.reply('```' + outputText + '```');
    }
  },
};

export = debugCommand; 