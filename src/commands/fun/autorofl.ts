import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder } from 'discord.js';
import { config } from '../../config';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { PermissionChecker } from '../../utils/permcheck';

const PERSIST_PATH = join(__dirname, '../../../autorofl-channels.json');

function loadAutoroflChannels(): Set<string> {
  if (existsSync(PERSIST_PATH)) {
    try {
      const data = JSON.parse(readFileSync(PERSIST_PATH, 'utf8'));
      return new Set(Array.isArray(data) ? data : []);
    } catch {
      return new Set();
    }
  }
  return new Set();
}

function saveAutoroflChannels(channels: Set<string>) {
  writeFileSync(PERSIST_PATH, JSON.stringify(Array.from(channels)), 'utf8');
}

export const autoroflChannels = loadAutoroflChannels();

const autorofl: Command = {
  options: {
    name: 'autorofl',
    description: 'Auto-reacts to every message in this channel with 🤣 until stopped. (Owner only, persistent)',
    category: 'fun',
    usage: 'autorofl [stop]',
    examples: ['autorofl', 'autorofl stop'],
    ownerOnly: true
  },
  execute: async ({ message, client, args }: CommandExecuteOptions) => {
    if (!message) return;
    if (!PermissionChecker.isAdmin(message.author.id, message.member ?? undefined)) {
      await message.reply('Only bot admins can use this command.');
      return;
    }
    const defaultColor = (config.embedColor as string) || '#2d0036';
    if (args && args[0] && args[0].toLowerCase() === 'stop') {
      if (!autoroflChannels.has(message.channelId)) {
        await message.reply('Auto-rofl is not active in this channel.');
        return;
      }
      autoroflChannels.delete(message.channelId);
      saveAutoroflChannels(autoroflChannels);
      const embed = new EmbedBuilder()
        .setColor(defaultColor as any)
        .setTitle('🤣 Auto-rofl Stopped')
        .setDescription('The bot will no longer auto-react with 🤣 in this channel.');
      await message.reply({ embeds: [embed] });
    } else {
      if (autoroflChannels.has(message.channelId)) {
        await message.reply('Auto-rofl is already active in this channel!');
        return;
      }
      autoroflChannels.add(message.channelId);
      saveAutoroflChannels(autoroflChannels);
      const embed = new EmbedBuilder()
        .setColor(defaultColor as any)
        .setTitle('🤣 Auto-rofl Started')
        .setDescription('The bot will now auto-react to every message in this channel with 🤣 until you run `autorofl stop`.');
      await message.reply({ embeds: [embed] });
    }
  }
};
export default autorofl; 