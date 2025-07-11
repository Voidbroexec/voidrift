import { Command } from '../../types/command';
import { PermissionChecker } from '../../utils/permcheck';
import { PermissionFlagsBits, TextChannel } from 'discord.js';

const unlock: Command = {
  options: {
    name: 'unlock',
    description: 'Unlock the current channel (allow SendMessages for @everyone).',
    category: 'moderation',
    usage: '!unlock',
    permissions: ['ManageChannels'],
    guildOnly: true
  },
  execute: async ({ message }) => {
    if (!message || !message.member || !message.guild) return;
    if (!PermissionChecker.isAdmin(message.author.id, message.member) && !message.member.permissions.has('ManageChannels')) {
      await message.reply('You need the Manage Channels permission or be a bot admin to use this command.');
      return;
    }
    if (!(message.channel instanceof TextChannel)) {
      await message.reply('This command can only be used in text channels.');
      return;
    }
    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      SendMessages: true
    });
    await message.reply('🔓 Channel unlocked. Everyone can send messages now.');
  }
};

export default unlock; 