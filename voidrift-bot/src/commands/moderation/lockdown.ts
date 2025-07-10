import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { config } from '../../config';

/**
 * Lockdown command - lock all channels in emergency situations
 * Critical moderation tool for cybersecurity/IT communities during incidents
 */
const lockdown: Command = {
  options: {
    name: 'lockdown',
    description: 'Lock all channels in emergency situations (requires Administrator permission).',
    category: 'moderation',
    usage: '/lockdown [reason]',
    examples: ['/lockdown Security incident', '/lockdown Emergency maintenance']
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message || !message.guild) {
      await message?.reply('❌ This command can only be used in a server!');
      return;
    }

    // Check permissions
    if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
      await message.reply('❌ You need Administrator permission to use this command!');
      return;
    }

    if (!message.guild.members.me?.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await message.reply('❌ I need the "Manage Channels" permission to use this command!');
      return;
    }

    const reason = args?.join(' ') || 'Emergency lockdown initiated';

    // Check for suspicious reasons
    const suspiciousKeywords = ['test', 'joke', 'fun', 'lol', 'haha'];
    const hasSuspiciousReason = suspiciousKeywords.some(keyword => 
      reason.toLowerCase().includes(keyword)
    );

    if (hasSuspiciousReason) {
      await message.reply('⚠️ **Warning:** This appears to be a test lockdown. Please confirm this is a real emergency.');
      return;
    }

    try {
      // Get all text channels
      const textChannels = message.guild.channels.cache.filter(
        channel => channel.type === ChannelType.GuildText
      );

      if (textChannels.size === 0) {
        await message.reply('❌ No text channels found to lock!');
        return;
      }

      // Lock each channel
      let lockedCount = 0;
      let failedCount = 0;

      for (const [, channel] of textChannels) {
        try {
          await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
            SendMessages: false,
            AddReactions: false,
            CreatePublicThreads: false,
            CreatePrivateThreads: false,
            SendMessagesInThreads: false
          });
          lockedCount++;
        } catch (error) {
          console.error(`Failed to lock channel ${channel.name}:`, error);
          failedCount++;
        }
      }

      // Create lockdown embed
      const defaultColor = (config.embedColor as string) || '#2d0036';
      const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle(`🚨 SERVER LOCKDOWN INITIATED`)
        .setDescription(`**Reason:** ${reason}\n**Status:** All text channels have been locked`)
        .addFields(
          { 
            name: '📊 Lockdown Statistics', 
            value: `**Channels Locked:** ${lockedCount}\n**Failed Locks:** ${failedCount}\n**Total Channels:** ${textChannels.size}`, 
            inline: false 
          },
          { 
            name: '👮 Administrator', 
            value: `${message.author.toString()} (${message.author.tag})`, 
            inline: false 
          },
          { 
            name: '⚠️ Emergency Notice', 
            value: 'All users are temporarily prevented from sending messages. This is a security measure.', 
            inline: false 
          }
        )
        .setFooter({ 
          text: `Cybersecurity Emergency Response • ${new Date().toLocaleString()}` 
        })
        .setTimestamp();

      await message.reply({ embeds: [embed] });

      // Send emergency notification to all channels that were successfully locked
      const emergencyMessage = `🚨 **EMERGENCY LOCKDOWN** 🚨\n\n**Reason:** ${reason}\n**Initiated by:** ${message.author.tag}\n\nAll channels are temporarily locked for security reasons. Please wait for further instructions.`;

      for (const [, channel] of textChannels) {
        try {
          if (lockedCount > 0) {
            await channel.send({ content: emergencyMessage });
          }
        } catch (error) {
          console.error(`Failed to send emergency message to ${channel.name}:`, error);
        }
      }
      
    } catch (error) {
      console.error('Error during lockdown:', error);
      await message.reply('❌ Failed to initiate lockdown. Please check permissions and try again.');
    }
  }
};

export default lockdown; 