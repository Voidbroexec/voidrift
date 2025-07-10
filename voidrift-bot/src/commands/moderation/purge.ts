import { Command } from '../../types/command';
import { TextChannel } from 'discord.js';
import { PermissionChecker } from '../../utils/permcheck';

const purge: Command = {
  options: {
    name: 'purge',
    description: 'Bulk delete messages in a channel.',
    category: 'moderation',
    usage: '!purge <amount>'
  },
  execute: async ({ message, args }) => {
    if (!message || !message.member || !message.guild) return;
    if (!PermissionChecker.isAdmin(message.author.id, message.member) && !message.member.permissions.has('ManageMessages')) {
      await message.reply('You need the Manage Messages permission or be a bot admin to use this command.');
      return;
    }
    const amountStr = args?.[0] ?? '';
    const amount = parseInt(amountStr, 10);
    if (isNaN(amount) || amount < 1 || amount > 100) {
      await message.reply('Please provide a number between 1 and 100.');
      return;
    }
    if (message.channel instanceof TextChannel) {
      // Check if bot has permission to Manage Messages
      const botMember = await message.guild.members.fetchMe();
      if (!botMember.permissionsIn(message.channel).has('ManageMessages')) {
        await message.reply('I need the **Manage Messages** permission to purge messages in this channel.');
        return;
      }
      await message.channel.bulkDelete(amount, true);
      await message.reply(`Deleted ${amount} messages.`);
    } else {
      await message.reply('This command can only be used in text channels.');
    }
  }
};

export default purge; 