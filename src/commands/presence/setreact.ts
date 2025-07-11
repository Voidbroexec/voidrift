// setreact.ts - Temporarily auto-react to messages in a channel with a chosen emoji
// Usage: !setreact <emoji> <duration> <count>
// Example: !setreact 😎 2m 10msg
// The bot will react with the emoji for the next <duration> or <count> messages, whichever comes first.

import { EmbedBuilder, ColorResolvable, Message } from 'discord.js';
import { CommandOptions, CommandExecuteOptions } from '../../types/command';
import { config } from '../../config';

// In-memory store for active auto-reacts per channel
// Structure: { [channelId]: { emoji, expiresAt, remainingMessages } }
export const activeReacts: Record<string, { emoji: string; expiresAt: number; remainingMessages: number }> = {};

// Per-channel dry mode state
export const dryModeChannels: Record<string, boolean> = {};

// Helper to parse duration strings like '2m', '30s', '1h' into milliseconds
function parseDuration(str: string): number {
  const match = str.match(/(\d+)([smh])/);
  if (!match) return 0;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  if (unit === 's') return value * 1000;
  if (unit === 'm') return value * 60 * 1000;
  if (unit === 'h') return value * 60 * 60 * 1000;
  return 0;
}

const setreact = {
  options: {
    name: 'setreact',
    description: 'Auto-react to messages with an emoji for a set time, count, or toggle dry mode.',
    category: 'presence',
    usage: 'setreact <emoji> <duration> <count> | setreact dry | setreact dry off',
    examples: ['setreact 😎 2m 10msg', 'setreact :pog: 3m 5msg', 'setreact dry', 'setreact dry off'],
    ownerOnly: true
  } as CommandOptions,

  // Main command logic
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message || !args || args.length === 0) return;

    // Dry mode toggle
    if (args[0].toLowerCase() === 'dry') {
      if (args[1] && args[1].toLowerCase() === 'off') {
        dryModeChannels[message.channel.id] = false;
        await message.reply('Dry mode auto-react is now **disabled** in this channel.');
      } else {
        dryModeChannels[message.channel.id] = true;
        await message.reply('Dry mode auto-react is now **enabled** in this channel.');
      }
      return;
    }

    // Validate input for normal setreact
    if (args.length < 3) return;
    const emoji = args[0]; // Emoji to react with
    const durationStr = args[1]; // Duration string (e.g., '2m')
    const countStr = args[2]; // Message count string (e.g., '10msg')
    const duration = parseDuration(durationStr); // Duration in ms
    const countMatch = countStr.match(/(\d+)msg/);
    const count = countMatch ? parseInt(countMatch[1], 10) : 0;
    if (!duration || !count) {
      await message.reply('Usage: setreact <emoji> <duration> <count>. Example: setreact 😎 2m 10msg');
      return;
    }
    // Store the auto-react state for this channel
    activeReacts[message.channel.id] = {
      emoji,
      expiresAt: Date.now() + duration,
      remainingMessages: count
    };
    // Confirmation embed
    const embed = new EmbedBuilder()
      .setColor(config.embedColor as ColorResolvable)
      .setTitle('Auto React Activated')
      .setDescription(`Reacting with ${emoji} for the next ${durationStr} or ${count} messages, whichever comes first.`);
    await message.reply({ embeds: [embed] });
  }
};

export default setreact;
