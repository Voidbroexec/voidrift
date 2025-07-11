import { Command } from '../../types/command';
import { PermissionChecker } from '../../utils/permcheck';

const mute: Command = {
  options: {
    name: 'mute',
    description: 'Mute (timeout) a user for a specified number of minutes.',
    category: 'moderation',
    usage: '!mute <@user> <minutes> <reason>',
    permissions: ['ModerateMembers'],
    guildOnly: true
  },
  execute: async ({ message, args }) => {
    if (!message || !message.member || !message.guild) return;
    if (!PermissionChecker.isAdmin(message.author.id, message.member) && !message.member.permissions.has('ModerateMembers')) {
      await message.reply('You need the Moderate Members permission or be a bot admin to use this command.');
      return;
    }
    const user = message.mentions.members?.first();
    const minutes = parseInt(args?.[1] || '', 10);
    const reason = args?.slice(2).join(' ') || 'No reason provided';
    if (!user) {
      await message.reply('Please mention a user to mute.');
      return;
    }
    if (isNaN(minutes) || minutes < 1 || minutes > 10080) {
      await message.reply('Please provide a valid number of minutes (1-10080).');
      return;
    }
    if (!user.moderatable) {
      await message.reply('I cannot mute this user.');
      return;
    }
    await user.timeout(minutes * 60 * 1000, reason);
    await message.reply(`${user} has been muted for ${minutes} minutes. Reason: ${reason}`);
    // Optionally, log to a channel or database
  }
};

export default mute; 