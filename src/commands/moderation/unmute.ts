import { Command } from '../../types/command';
import { PermissionChecker } from '../../utils/permcheck';

const unmute: Command = {
  options: {
    name: 'unmute',
    description: 'Unmute (remove timeout) from a user.',
    category: 'moderation',
    usage: '!unmute <@user> <reason>',
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
    const reason = args?.slice(1).join(' ') || 'No reason provided';
    if (!user) {
      await message.reply('Please mention a user to unmute.');
      return;
    }
    if (!user.moderatable) {
      await message.reply('I cannot unmute this user.');
      return;
    }
    await user.timeout(null, reason);
    await message.reply(`${user} has been unmuted. Reason: ${reason}`);
    // Optionally, log to a channel or database
  }
};

export default unmute; 