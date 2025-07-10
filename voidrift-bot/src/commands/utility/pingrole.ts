import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder, Role, PermissionFlagsBits } from 'discord.js';
import { config } from '../../config';

/**
 * Pingrole command - ping a role with permission checks
 * Essential for cybersecurity/IT communities to manage role mentions
 */
const pingrole: Command = {
  options: {
    name: 'pingrole',
    description: 'Ping a role with permission checks and moderation features.',
    category: 'utility',
    usage: '/pingrole [@role] [message]',
    examples: ['/pingrole @Moderator Server maintenance', '/pingrole @Announcements Important update']
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message || !message.guild) {
      await message?.reply('❌ This command can only be used in a server!');
      return;
    }

    // Check if user has permission to mention roles
    if (!message.member?.permissions.has(PermissionFlagsBits.MentionEveryone)) {
      await message.reply('❌ You need the "Mention Everyone" permission to use this command!');
      return;
    }

    if (!args || args.length < 1) {
      await message.reply('❌ Please specify a role! Usage: `/pingrole @role [message]`');
      return;
    }

    let targetRole: Role | null = null;
    const roleMention = args[0];
    const roleId = roleMention.replace(/[<@&>]/g, '');
    
    try {
      targetRole = await message.guild.roles.fetch(roleId);
    } catch {
      // Try to find by name
      const roleByName = message.guild.roles.cache.find(
        role => role.name.toLowerCase() === roleMention.toLowerCase()
      );
      if (roleByName) {
        targetRole = roleByName;
      } else {
        await message.reply('❌ Role not found!');
        return;
      }
    }

    if (!targetRole) {
      await message.reply('❌ Role not found!');
      return;
    }

    // Check if role is mentionable
    if (!targetRole.mentionable) {
      await message.reply('❌ This role is not mentionable!');
      return;
    }

    // Get the message content (everything after the role)
    const messageContent = args.slice(1).join(' ') || 'No message provided';

    // Check for suspicious content in message
    const suspiciousKeywords = ['discord.gift', 'nitro', 'free', 'hack', 'crack', 'steal'];
    const hasSuspiciousContent = suspiciousKeywords.some(keyword => 
      messageContent.toLowerCase().includes(keyword)
    );

    if (hasSuspiciousContent) {
      await message.reply('⚠️ Your message contains suspicious keywords. Please review and try again.');
      return;
    }

    // Create ping embed
    const defaultColor = (config.embedColor as string) || '#2d0036';
    const embed = new EmbedBuilder()
      .setColor(defaultColor as any)
      .setTitle(`🔔 Role Ping: ${targetRole.name}`)
      .setDescription(`${targetRole.toString()}\n\n**Message:** ${messageContent}`)
      .addFields(
        { 
          name: '📊 Ping Information', 
          value: `**Role:** ${targetRole.name}\n**Members:** ${targetRole.members.size}\n**Color:** ${targetRole.hexColor}`, 
          inline: false 
        },
        { 
          name: '👤 Pinged By', 
          value: `${message.author.toString()} (${message.author.tag})`, 
          inline: false 
        }
      )
      .setFooter({ 
        text: `Cybersecurity Role Ping • ${new Date().toLocaleString()}` 
      })
      .setTimestamp();

    // Add warning for high-permission roles
    const dangerousPermissions = [
      PermissionFlagsBits.Administrator,
      PermissionFlagsBits.ManageGuild,
      PermissionFlagsBits.ManageRoles,
      PermissionFlagsBits.ManageChannels
    ];

    if (targetRole.permissions.has(dangerousPermissions)) {
      embed.addFields({
        name: '⚠️ High-Permission Role',
        value: 'This role has administrative privileges. Use with caution.',
        inline: false
      });
      embed.setColor('#ff6b6b');
    }

    try {
      await message.reply({ 
        content: `${targetRole.toString()}`,
        embeds: [embed] 
      });
    } catch (error) {
      console.error('Error pinging role:', error);
      await message.reply('❌ Failed to ping the role. Please check permissions and try again.');
    }
  }
};

export default pingrole; 