import { Command, CommandExecuteOptions } from '../../types/command';
const serverstats: Command = {
  options: {
    name: 'serverstats',
    description: 'Show server stats (channels, roles, emojis, etc.).',
    category: 'utility',
    usage: '/serverstats'
  },
  execute: async ({ message, client }: CommandExecuteOptions) => {
    if (!message || !message.guild) return;
    const { guild } = message;
    await message.reply(
      `Server: **${guild.name}**\n` +
      `Members: ${guild.memberCount}\n` +
      `Channels: ${guild.channels.cache.size}\n` +
      `Roles: ${guild.roles.cache.size}\n` +
      `Emojis: ${guild.emojis.cache.size}`
    );
  }
};
export default serverstats; 