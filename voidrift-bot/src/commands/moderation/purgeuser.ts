import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder, PermissionFlagsBits, User } from 'discord.js';
import { config } from '../../config';

/**
 * Purgeuser command - purge messages from a specific user
 * Essential moderation tool for cybersecurity/IT communities
 */
const purgeuser: Command = {
  options: {
    name: 'purgeuser',
    description: 'Purge messages from a specific user (requires Manage Messages permission).',
    category: 'moderation',
    usage: '/purgeuser [@user] [amount]',
    examples: ['/purgeuser @spammer 50', '/purgeuser @user 10']
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message || !message.guild) {
      await message?.reply('❌ This command can only be used in a server!');
      return;
    }

    // Check permissions
    if (!message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
      await message.reply('❌ You need the "Manage Messages" permission to use this command!');
      return;
    }

    if (!message.guild.members.me?.permissions.has(PermissionFlagsBits.ManageMessages)) {
      await message.reply('❌ I need the "Manage Messages" permission to use this command!');
      return;
    }

    if (!args || args.length < 2) {
      await message.reply('❌ Please specify a user and amount! Usage: `/purgeuser @user [amount]`');
      return;
    }

    // Parse user
    let targetUser: User | null = null;
    const userMention = args[0];
    const userId = userMention.replace(/[<@!>]/g, '');
    
    try {
      targetUser = await message.client.users.fetch(userId);
    } catch {
      await message.reply('❌ User not found!');
      return;
    }

    if (!targetUser) {
      await message.reply('❌ User not found!');
      return;
    }

    // Parse amount
    const amount = parseInt(args[1]);
    if (isNaN(amount) || amount < 1 || amount > 100) {
      await message.reply('❌ Amount must be a number between 1 and 100!');
      return;
    }

    // Check if user is trying to purge their own messages
    if (targetUser.id === message.author.id) {
      await message.reply('❌ You cannot purge your own messages!');
      return;
    }

    // Check if user is trying to purge bot messages
    if (targetUser.id === message.client.user?.id) {
      await message.reply('❌ You cannot purge bot messages!');
      return;
    }

    try {
      // Check if channel supports bulk delete
      if (!('bulkDelete' in message.channel)) {
        await message.reply('❌ This channel type does not support bulk deletion!');
        return;
      }

      // Fetch messages and filter by user
      const messages = await message.channel.messages.fetch({ limit: 100 });
      const userMessages = messages.filter(msg => msg.author.id === targetUser!.id).first(amount);

      if (userMessages.length === 0) {
        await message.reply('❌ No messages found from that user in the last 100 messages!');
        return;
      }

      // Delete messages
      const deletedMessages = await (message.channel as any).bulkDelete(userMessages, true);

      // Create success embed
      const defaultColor = (config.embedColor as string) || '#2d0036';
      const embed = new EmbedBuilder()
        .setColor(defaultColor as any)
        .setTitle(`🧹 User Messages Purged`)
        .setDescription(`**Target User:** ${targetUser.toString()} (${targetUser.tag})`)
        .addFields(
          { 
            name: '📊 Purge Statistics', 
            value: `**Messages Deleted:** ${deletedMessages.size}\n**Requested Amount:** ${amount}\n**Channel:** ${message.channel.toString()}`, 
            inline: false 
          },
          { 
            name: '👮 Moderator', 
            value: `${message.author.toString()} (${message.author.tag})`, 
            inline: false 
          }
        )
        .setFooter({ 
          text: `Cybersecurity Moderation Tool • ${new Date().toLocaleString()}` 
        })
        .setTimestamp();

      // Add warning for large purges
      if (deletedMessages.size >= 50) {
        embed.addFields({
          name: '⚠️ Large Purge',
          value: 'This was a significant message purge. Consider reviewing the user\'s behavior.',
          inline: false
        });
        embed.setColor('#ff6b6b');
      }

      await message.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error purging user messages:', error);
      await message.reply('❌ Failed to purge messages. Messages older than 14 days cannot be bulk deleted.');
    }
  }
};

export default purgeuser; 