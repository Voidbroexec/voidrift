import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder, Role, PermissionFlagsBits } from 'discord.js';
import { config } from '../../config';

/**
 * Roleinfo command - displays detailed information about a role
 * Essential for cybersecurity/IT communities to understand role permissions
 */
const roleinfo: Command = {
  options: {
    name: 'roleinfo',
    description: 'Get detailed information about a role: permissions, members, color, and more.',
    category: 'utility',
    usage: '/roleinfo [@role]',
    examples: ['/roleinfo @Moderator', '/roleinfo 123456789']
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message || !message.guild) {
      await message?.reply('❌ This command can only be used in a server!');
      return;
    }

    let targetRole: Role | null = null;
    
    // Parse role argument
    if (args && args.length > 0) {
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
    } else {
      await message.reply('❌ Please specify a role! Usage: `/roleinfo @role`');
      return;
    }

    if (!targetRole) {
      await message.reply('❌ Role not found!');
      return;
    }

    // Get role permissions
    const permissions = targetRole.permissions.toArray();
    const dangerousPermissions = [
      PermissionFlagsBits.Administrator,
      PermissionFlagsBits.ManageGuild,
      PermissionFlagsBits.ManageRoles,
      PermissionFlagsBits.ManageChannels,
      PermissionFlagsBits.ManageMessages,
      PermissionFlagsBits.BanMembers,
      PermissionFlagsBits.KickMembers,
      PermissionFlagsBits.ManageWebhooks
    ];

    const hasDangerousPerms = targetRole.permissions.has(dangerousPermissions);
    
    // Count members with this role
    const memberCount = targetRole.members.size;

    // Create role info embed
    const defaultColor = (config.embedColor as string) || '#2d0036';
    const embed = new EmbedBuilder()
      .setColor(targetRole.color || defaultColor as any)
      .setTitle(`🎭 Role Information: ${targetRole.name}`)
      .setDescription(`**Role:** ${targetRole.toString()}\n**Role ID:** \`${targetRole.id}\``)
      .addFields(
        { 
          name: '📊 Basic Information', 
          value: `**Name:** ${targetRole.name}\n**Color:** ${targetRole.hexColor}\n**Position:** ${targetRole.position}\n**Members:** ${memberCount}`, 
          inline: false 
        },
        { 
          name: '🔐 Security Status', 
          value: hasDangerousPerms ? '⚠️ **High Permissions:** This role has administrative privileges' : '✅ **Standard Permissions:** No dangerous permissions detected', 
          inline: false 
        },
        { 
          name: '⚙️ Role Settings', 
          value: `**Hoisted:** ${targetRole.hoist ? 'Yes' : 'No'}\n**Mentionable:** ${targetRole.mentionable ? 'Yes' : 'No'}\n**Managed:** ${targetRole.managed ? 'Yes' : 'No'}\n**Created:** <t:${Math.floor(targetRole.createdTimestamp / 1000)}:F>`, 
          inline: false 
        }
      )
      .setFooter({ 
        text: `Requested by ${message.author.tag} • Cybersecurity Role Analysis` 
      })
      .setTimestamp();

    // Add permissions field if there are any
    if (permissions.length > 0) {
      const permList = permissions
        .map(perm => `• ${perm.replace(/([A-Z])/g, ' $1').trim()}`)
        .join('\n');
      
      embed.addFields({
        name: '🔑 Permissions',
        value: permList.length > 1024 ? permList.substring(0, 1021) + '...' : permList,
        inline: false
      });
    } else {
      embed.addFields({
        name: '🔑 Permissions',
        value: 'No special permissions',
        inline: false
      });
    }

    // Add warning color for dangerous roles
    if (hasDangerousPerms) {
      embed.setColor('#ff6b6b');
    }

    await message.reply({ embeds: [embed] });
  }
};

export default roleinfo; 