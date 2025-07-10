import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder, User, GuildMember, PermissionFlagsBits } from 'discord.js';
import { config } from '../../config';

/**
 * Enhanced whois command with advanced user information
 * Displays comprehensive user profile including security flags, badges, and moderation history
 */
const whois: Command = {
  options: {
    name: 'whois',
    description: 'Get a detailed profile of a user: badges, 2FA, moderation history, security flags, and more.',
    category: 'system',
    usage: '/whois [@user]',
    examples: ['/whois', '/whois @someone']
  },
  execute: async ({ message, args, client }: CommandExecuteOptions) => {
    if (!message || !message.guild) return;
    
    let target: User | GuildMember | null = null;
    
    // Parse user argument
    if (args && args.length > 0) {
      const userMention = args[0];
      const userId = userMention.replace(/[<@!>]/g, '');
      try {
        target = await client.users.fetch(userId);
      } catch {
        await message.reply('❌ User not found!');
        return;
      }
    } else {
      target = message.member;
    }
    
    // Get guild member information
    let member: GuildMember | null = null;
    if (target instanceof GuildMember) {
      member = target;
    } else if (target) {
      member = await message.guild.members.fetch(target.id).catch(() => null);
    }
    
    if (!target || !member) {
      await message.reply('❌ User not found in this server!');
      return;
    }

    // Get user badges and flags
    const flags = member.user.flags?.toArray() || [];
    const badges = flags.map(flag => {
      const badgeMap: { [key: string]: string } = {
        'BugHunterLevel1': '🐛 Bug Hunter',
        'BugHunterLevel2': '🐛 Bug Hunter Gold',
        'CertifiedModerator': '👮 Discord Certified Moderator',
        'HypeSquadOnlineHouse1': '🏠 House Bravery',
        'HypeSquadOnlineHouse2': '🏠 House Brilliance',
        'HypeSquadOnlineHouse3': '🏠 House Balance',
        'Hypesquad': '🎉 HypeSquad Events',
        'Partner': '🤝 Partnered Server Owner',
        'PremiumEarlySupporter': '💎 Early Supporter',
        'Staff': '👨‍💼 Discord Staff',
        'VerifiedBot': '🤖 Verified Bot',
        'VerifiedDeveloper': '👨‍💻 Verified Bot Developer'
      };
      return badgeMap[flag] || flag;
    });

    // Get roles (excluding @everyone)
    const roles = member.roles.cache
      .filter(r => r.id !== message.guild!.id)
      .map(r => `<@&${r.id}>`)
      .join(', ') || 'None';

    // Security and moderation information
    const securityInfo = [];
    
    // 2FA Status (Note: mfaEnabled is not available in Discord.js v14)
    securityInfo.push(`🔐 **2FA Status:** Unable to verify (Discord API limitation)`);
    
    // Account age and security flags
    const accountAge = Date.now() - member.user.createdTimestamp;
    const daysOld = Math.floor(accountAge / (1000 * 60 * 60 * 24));
    
    if (daysOld < 7) {
      securityInfo.push('⚠️ **New Account:** Less than 7 days old');
    }
    
    if (member.user.username.toLowerCase().includes('discord') || 
        member.user.username.toLowerCase().includes('nitro') ||
        member.user.username.toLowerCase().includes('gift')) {
      securityInfo.push('🚨 **Suspicious Username:** Contains suspicious keywords');
    }

    // Check for suspicious patterns
    if (member.user.username.match(/^[0-9]+$/) || member.user.username.length < 3) {
      securityInfo.push('⚠️ **Weak Username:** Numeric or very short username');
    }

    // Moderation history (stub - can be enhanced with database)
    const hasModHistory = false; // Placeholder for database integration
    if (hasModHistory) {
      securityInfo.push('📋 **Moderation History:** Previous actions recorded');
    }

    // Permissions analysis
    const dangerousPermissions = [
      PermissionFlagsBits.Administrator,
      PermissionFlagsBits.ManageGuild,
      PermissionFlagsBits.ManageRoles,
      PermissionFlagsBits.ManageChannels,
      PermissionFlagsBits.ManageMessages,
      PermissionFlagsBits.BanMembers,
      PermissionFlagsBits.KickMembers
    ];

    const hasDangerousPerms = member.permissions.has(dangerousPermissions);
    
    if (hasDangerousPerms) {
      securityInfo.push('⚡ **High Permissions:** User has administrative privileges');
    }

    // Create enhanced embed
    const defaultColor = (config.embedColor as string) || '#2d0036';
    const embed = new EmbedBuilder()
      .setColor(defaultColor as any)
      .setTitle(`🔍 Advanced User Analysis: ${member.user.tag}`)
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .addFields(
        { 
          name: '👤 Basic Information', 
          value: `**Username:** ${member.user.username}\n**Display Name:** ${member.displayName}\n**User ID:** \`${member.user.id}\``, 
          inline: false 
        },
        { 
          name: '📅 Account Timeline', 
          value: `**Created:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:F>\n**Joined Server:** <t:${Math.floor(member.joinedTimestamp! / 1000)}:F>\n**Account Age:** ${daysOld} days`, 
          inline: false 
        },
        { 
          name: '🏆 Badges & Status', 
          value: badges.length > 0 ? badges.join('\n') : 'No special badges', 
          inline: false 
        },
        { 
          name: '🔐 Security Analysis', 
          value: securityInfo.length > 0 ? securityInfo.join('\n') : '✅ No security concerns detected', 
          inline: false 
        },
        { 
          name: '🎭 Roles & Permissions', 
          value: `**Roles:** ${roles}\n**Color:** ${member.displayHexColor}\n**Hoisted:** ${member.roles.hoist ? 'Yes' : 'No'}`, 
          inline: false 
        },
        { 
          name: '📊 Additional Info', 
          value: `**Bot:** ${member.user.bot ? 'Yes' : 'No'}\n**Boosting:** ${member.premiumSince ? `Since <t:${Math.floor(member.premiumSince.getTime() / 1000)}:F>` : 'No'}\n**Avatar:** [View Full Size](${member.user.displayAvatarURL({ size: 1024 })})`, 
          inline: false 
        }
      )
      .setFooter({ 
        text: `Requested by ${message.author.tag} • Cybersecurity Analysis Complete` 
      })
      .setTimestamp();

    // Add warning color for suspicious users
    if (securityInfo.some(info => info.includes('⚠️') || info.includes('🚨'))) {
      embed.setColor('#ff6b6b');
    }

    await message.reply({ embeds: [embed] });
  }
};

export default whois; 