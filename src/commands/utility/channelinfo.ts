import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder, Channel, TextChannel, VoiceChannel, CategoryChannel, PermissionFlagsBits } from 'discord.js';
import { config } from '../../config';

/**
 * Channelinfo command - displays detailed information about a channel
 * Essential for cybersecurity/IT communities to understand channel configurations
 */
const channelinfo: Command = {
  options: {
    name: 'channelinfo',
    description: 'Get detailed information about a channel: permissions, settings, and statistics.',
    category: 'utility',
    usage: '/channelinfo [#channel]',
    examples: ['/channelinfo #general', '/channelinfo 123456789']
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message || !message.guild) {
      await message?.reply('❌ This command can only be used in a server!');
      return;
    }

    let targetChannel: Channel | null = null;
    
    // Parse channel argument
    if (args && args.length > 0) {
      const channelMention = args[0];
      const channelId = channelMention.replace(/[<#>]/g, '');
      
      try {
        targetChannel = await message.guild.channels.fetch(channelId);
      } catch {
        // Try to find by name
        const channelByName = message.guild.channels.cache.find(
          channel => channel.name.toLowerCase() === channelMention.toLowerCase()
        );
        if (channelByName) {
          targetChannel = channelByName;
        } else {
          await message.reply('❌ Channel not found!');
          return;
        }
      }
    } else {
      targetChannel = message.channel;
    }

    if (!targetChannel) {
      await message.reply('❌ Channel not found!');
      return;
    }

    // Get channel type
    const getChannelType = (channel: Channel): string => {
      if (channel instanceof TextChannel) return 'Text Channel';
      if (channel instanceof VoiceChannel) return 'Voice Channel';
      if (channel instanceof CategoryChannel) return 'Category';
      return 'Unknown';
    };

    // Get channel-specific information
    let channelSpecificInfo = '';
    let memberCount = 0;
    
    if (targetChannel instanceof TextChannel) {
      channelSpecificInfo = `**Topic:** ${targetChannel.topic || 'No topic set'}\n**NSFW:** ${targetChannel.nsfw ? 'Yes' : 'No'}\n**Slowmode:** ${targetChannel.rateLimitPerUser}s`;
    } else if (targetChannel instanceof VoiceChannel) {
      memberCount = targetChannel.members.size;
      channelSpecificInfo = `**User Limit:** ${targetChannel.userLimit || 'No limit'}\n**Bitrate:** ${targetChannel.bitrate}kbps\n**Connected Users:** ${memberCount}`;
    } else if (targetChannel instanceof CategoryChannel) {
      const children = targetChannel.children.cache;
      channelSpecificInfo = `**Children:** ${children.size} channels\n**Text Channels:** ${children.filter(c => c instanceof TextChannel).size}\n**Voice Channels:** ${children.filter(c => c instanceof VoiceChannel).size}`;
    }

    // Get channel permissions (only for guild channels)
    let permissions: string[] = [];
    let hasDangerousPerms = false;
    
    if ('permissionsFor' in targetChannel) {
      permissions = targetChannel.permissionsFor(message.guild.roles.everyone)?.toArray() || [];
      const dangerousPermissions = [
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.ManageWebhooks,
        PermissionFlagsBits.ManageRoles
      ];
      hasDangerousPerms = targetChannel.permissionsFor(message.guild.roles.everyone)?.has(dangerousPermissions) || false;
    }

    // Create channel info embed
    const defaultColor = (config.embedColor as string) || '#2d0036';
    const channelName = 'name' in targetChannel ? targetChannel.name : 'Unknown';
    const embed = new EmbedBuilder()
      .setColor(defaultColor as any)
      .setTitle(`📺 Channel Information: ${channelName}`)
      .setDescription(`**Channel:** ${targetChannel.toString()}\n**Channel ID:** \`${targetChannel.id}\``)
      .addFields(
        { 
          name: '📊 Basic Information', 
          value: `**Name:** ${channelName}\n**Type:** ${getChannelType(targetChannel)}\n**Position:** ${'position' in targetChannel ? targetChannel.position : 'N/A'}\n**Created:** <t:${Math.floor((targetChannel.createdTimestamp || Date.now()) / 1000)}:F>`, 
          inline: false 
        },
        { 
          name: '🔐 Security Status', 
          value: hasDangerousPerms ? '⚠️ **High Permissions:** This channel has administrative privileges' : '✅ **Standard Permissions:** No dangerous permissions detected', 
          inline: false 
        },
        { 
          name: '⚙️ Channel Settings', 
          value: channelSpecificInfo || 'No specific settings', 
          inline: false 
        }
      )
      .setFooter({ 
        text: `Requested by ${message.author.tag} • Cybersecurity Channel Analysis` 
      })
      .setTimestamp();

    // Add permissions field if there are any
    if (permissions.length > 0) {
      const permList = permissions
        .map((perm: string) => `• ${perm.replace(/([A-Z])/g, ' $1').trim()}`)
        .join('\n');
      
      embed.addFields({
        name: '🔑 @everyone Permissions',
        value: permList.length > 1024 ? permList.substring(0, 1021) + '...' : permList,
        inline: false
      });
    } else {
      embed.addFields({
        name: '🔑 @everyone Permissions',
        value: 'No special permissions',
        inline: false
      });
    }

    // Add warning color for dangerous channels
    if (hasDangerousPerms) {
      embed.setColor('#ff6b6b');
    }

    await message.reply({ embeds: [embed] });
  }
};

export default channelinfo; 