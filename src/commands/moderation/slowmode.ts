import { Command } from '../../types/command';
import { TextChannel } from 'discord.js';
const slowmode: Command = {
  options: {
    name: 'slowmode',
    description: 'Set slowmode for the current channel.',
    category: 'moderation',
    usage: '!slowmode <seconds>'
  },
  execute: async ({ message, args }) => {
    if (!message || !message.member || !message.guild) return;
    if (!message.member.permissions.has('ManageChannels')) {
      await message.reply('You do not have permission to use this command.');
      return;
    }
    const secondsStr = args?.[0] ?? '';
    const seconds = parseInt(secondsStr, 10);
    if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
      await message.reply('Please provide a valid number of seconds (0-21600).');
      return;
    }
    if (message.channel instanceof TextChannel) {
      await message.channel.setRateLimitPerUser(seconds);
      await message.reply(`Slowmode set to ${seconds} seconds.`);
    } else {
      await message.reply('This command can only be used in text channels.');
    }
  }
};
export default slowmode; 