import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder, TextChannel } from 'discord.js';
import { config } from '../../config';
import { PermissionChecker } from '../../utils/permcheck';

const MAX_SPAM = 30;
const COOLDOWN = 10 * 1000; // 10 seconds
const userCooldowns = new Map<string, number>();

const spam: Command = {
  options: {
    name: 'spam',
    description: 'Spam a message in the channel (owner only, max 30).',
    category: 'fun',
    usage: 'spam <count> <text>',
    examples: ['spam 10 L', 'spam 5 bruh'],
    ownerOnly: true
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message) return;
    if (!PermissionChecker.isAdmin(message.author.id, message.member ?? undefined)) {
      await message.reply('Only bot admins can use this command.');
      return;
    }
    const now = Date.now();
    const lastUsed = userCooldowns.get(message.author.id) || 0;
    if (now - lastUsed < COOLDOWN) {
      await message.reply('You must wait before using this command again.');
      return;
    }
    userCooldowns.set(message.author.id, now);
    if (!args || args.length === 0) {
      await message.reply('Usage: spam <count> <text>');
      return;
    }
    const count = Math.min(parseInt(args[0], 10) || 1, MAX_SPAM);
    const text = args.slice(1).join(' ') || 'L';
    const channel = message.channel;
    if (channel.type !== 0) { // 0 = TextChannel in discord.js v14
      await message.reply('This command can only be used in text channels.');
      return;
    }
    for (let i = 0; i < count; i++) {
      await (channel as TextChannel).send(text);
    }
    const defaultColor = (config.embedColor as string) || '#2d0036';
    const embed = new EmbedBuilder()
      .setColor(defaultColor as any)
      .setTitle('Spam Complete')
      .setDescription(`Sent  [1m${count} [0m messages: ${text}`)
      .setFooter({ text: `Requested by ${message.author.tag}` });
    await message.reply({ embeds: [embed] });
  }
};
export default spam; 