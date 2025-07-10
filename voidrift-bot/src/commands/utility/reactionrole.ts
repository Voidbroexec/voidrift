import { Command, CommandExecuteOptions } from '../../types/command';
import { PermissionChecker } from '../../utils/permcheck';
import { TextChannel } from 'discord.js';

// In-memory mapping: messageId -> { emoji, roleId }
const reactionRoleMap: Record<string, { emoji: string, roleId: string }> = {};

const reactionrole: Command = {
  options: {
    name: 'reactionrole',
    description: 'Set up a reaction role message.',
    category: 'utility',
    usage: '/reactionrole <#channel> <message> <emoji> <role>',
    permissions: ['ManageRoles'],
    guildOnly: true
  },
  execute: async ({ message, args, client }: CommandExecuteOptions) => {
    if (!message || !message.guild || !message.member) return;
    if (!PermissionChecker.isAdmin(message.author.id, message.member) && !message.member.permissions.has('ManageRoles')) {
      await message.reply('You need the Manage Roles permission or be a bot admin to use this command.');
      return;
    }
    if (!args || args.length < 4) {
      await message.reply('Usage: !reactionrole <#channel> <message> <emoji> <role>');
      return;
    }
    const channelMention = args[0];
    const channelId = channelMention.replace(/<#(\d+)>/, '$1');
    const channel = message.guild.channels.cache.get(channelId) as TextChannel;
    if (!channel || channel.type !== 0) {
      await message.reply('Invalid channel.');
      return;
    }
    const emoji = args[args.length - 2];
    const roleName = args[args.length - 1];
    const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
    if (!role) {
      await message.reply('Role not found.');
      return;
    }
    const msgContent = args.slice(1, -2).join(' ');
    const sentMsg = await channel.send(msgContent);
    await sentMsg.react(emoji);
    reactionRoleMap[sentMsg.id] = { emoji, roleId: role.id };
    await message.reply('Reaction role set up!');
  }
};

// Export the map for use in the event handler
export { reactionRoleMap };
export default reactionrole; 