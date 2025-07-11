import { Command } from '../../types/command';
import { PermissionChecker } from '../../utils/permcheck';
import { PermissionFlagsBits, TextChannel } from 'discord.js';

const lock: Command = {
  options: {
    name: 'lock',
    description: 'Lock the current channel (deny SendMessages for @everyone).',
    category: 'moderation',
    usage: '!lock',
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
      SendMessages: false
    });
    await message.reply('🔒 Channel locked. Only staff can send messages now.');
  }
};

export default lock; 