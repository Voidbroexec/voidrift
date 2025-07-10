import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { config } from '../../config';

/**
 * Modlog command - display moderation actions
 * Essential for cybersecurity/IT communities to track moderation history
 */
const modlog: Command = {
  options: {
    name: 'modlog',
    description: 'Display moderation actions for a user or recent actions.',
    category: 'moderation',
    usage: '/modlog [@user] [amount]',
    examples: ['/modlog @user', '/modlog @user 10', '/modlog']
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message || !message.guild) {
      await message?.reply('❌ This command can only be used in a server!');
      return;
    }

    // Check permissions
    if (!message.member?.permissions.has(PermissionFlagsBits.ViewAuditLog)) {
      await message.reply('❌ You need the "View Audit Log" permission to use this command!');
      return;
    }

    if (!message.guild.members.me?.permissions.has(PermissionFlagsBits.ViewAuditLog)) {
      await message.reply('❌ I need the "View Audit Log" permission to use this command!');
      return;
    }

    try {
      let targetUser = null;
      let limit = 10; // Default limit

      // Parse arguments
      if (args && args.length > 0) {
        const firstArg = args[0];
        
        // Check if first argument is a user mention
        if (firstArg.match(/<@!?\d+>/)) {
          const userId = firstArg.replace(/[<@!>]/g, '');
          try {
            targetUser = await message.client.users.fetch(userId);
          } catch {
            await message.reply('❌ User not found!');
            return;
          }

          // Check for limit in second argument
          if (args.length > 1) {
            const limitArg = parseInt(args[1]);
            if (!isNaN(limitArg) && limitArg >= 1 && limitArg <= 50) {
              limit = limitArg;
            }
          }
        } else {
          // First argument might be a limit
          const limitArg = parseInt(firstArg);
          if (!isNaN(limitArg) && limitArg >= 1 && limitArg <= 50) {
            limit = limitArg;
          } else {
            await message.reply('❌ Invalid arguments! Usage: `/modlog [@user] [amount]`');
            return;
          }
        }
      }

      // Fetch audit logs
      const auditLogs = await message.guild.fetchAuditLogs({
        limit: limit,
        user: targetUser?.id
      });

      if (auditLogs.entries.size === 0) {
        const embed = new EmbedBuilder()
          .setColor('#ff6b6b')
          .setTitle('📋 No Moderation Actions Found')
          .setDescription(targetUser ? 
            `No moderation actions found for ${targetUser.toString()}` :
            'No recent moderation actions found in this server.'
          )
          .setFooter({ text: `Requested by ${message.author.tag}` })
          .setTimestamp();
        
        await message.reply({ embeds: [embed] });
        return;
      }

      // Create modlog embed
      const defaultColor = (config.embedColor as string) || '#2d0036';
      const embed = new EmbedBuilder()
        .setColor(defaultColor as any)
        .setTitle(`📋 Moderation Log`)
        .setDescription(targetUser ? 
          `**Target User:** ${targetUser.toString()} (${targetUser.tag})` :
          `**Recent Actions:** Last ${limit} moderation actions`
        )
        .setFooter({ 
          text: `Requested by ${message.author.tag} • Cybersecurity Moderation Log` 
        })
        .setTimestamp();

      // Add moderation actions
      const actionTypes: { [key: string]: string } = {
        'MEMBER_KICK': '👢 Kick',
        'MEMBER_BAN_ADD': '🔨 Ban',
        'MEMBER_BAN_REMOVE': '🔓 Unban',
        'MEMBER_UPDATE': '✏️ Member Update',
        'MEMBER_ROLE_UPDATE': '🎭 Role Update',
        'CHANNEL_CREATE': '📺 Channel Created',
        'CHANNEL_DELETE': '🗑️ Channel Deleted',
        'CHANNEL_UPDATE': '✏️ Channel Updated',
        'MESSAGE_DELETE': '🗑️ Message Deleted',
        'MESSAGE_BULK_DELETE': '🧹 Bulk Delete',
        'ROLE_CREATE': '🎭 Role Created',
        'ROLE_DELETE': '🗑️ Role Deleted',
        'ROLE_UPDATE': '✏️ Role Updated',
        'WEBHOOK_CREATE': '🔗 Webhook Created',
        'WEBHOOK_UPDATE': '✏️ Webhook Updated',
        'WEBHOOK_DELETE': '🗑️ Webhook Deleted',
        'EMOJI_CREATE': '😄 Emoji Created',
        'EMOJI_DELETE': '🗑️ Emoji Deleted',
        'EMOJI_UPDATE': '✏️ Emoji Updated',
        'INVITE_CREATE': '📨 Invite Created',
        'INVITE_DELETE': '🗑️ Invite Deleted'
      };

      let actionList = '';
      let actionCount = 0;

      for (const [, entry] of auditLogs.entries) {
        if (actionCount >= 10) break; // Limit to 10 actions in embed

        const actionType = actionTypes[entry.action] || entry.action;
        const executor = entry.executor ? `${entry.executor.tag}` : 'Unknown';
        const target = entry.target ? 
          ('tag' in entry.target ? entry.target.tag : 
           'username' in entry.target ? entry.target.username : 
           'name' in entry.target ? entry.target.name : 'Unknown') : 'N/A';
        const timestamp = `<t:${Math.floor(entry.createdTimestamp / 1000)}:R>`;
        const reason = entry.reason || 'No reason provided';

        actionList += `**${actionType}** by ${executor}\n`;
        actionList += `**Target:** ${target}\n`;
        actionList += `**Time:** ${timestamp}\n`;
        actionList += `**Reason:** ${reason}\n\n`;

        actionCount++;
      }

      if (actionList) {
        embed.addFields({
          name: `📊 Recent Actions (${actionCount}/${auditLogs.entries.size})`,
          value: actionList,
          inline: false
        });
      }

      // Add statistics
      const actionStats: { [key: string]: number } = {};
      for (const [, entry] of auditLogs.entries) {
        const actionType = entry.action;
        actionStats[actionType] = (actionStats[actionType] || 0) + 1;
      }

      const topActions = Object.entries(actionStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([action, count]) => `${actionTypes[action] || action}: ${count}`)
        .join('\n');

      if (topActions) {
        embed.addFields({
          name: '📈 Action Statistics',
          value: topActions,
          inline: false
        });
      }

      await message.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error fetching modlog:', error);
      await message.reply('❌ Failed to fetch moderation log. Please check permissions and try again.');
    }
  }
};

export default modlog; 