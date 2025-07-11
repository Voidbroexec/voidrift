import { GuildMember } from 'discord.js';
import { Event } from '../types/command';
import { config } from '../config';

const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID || '';
const AUTO_ROLE_ID = process.env.AUTO_ROLE_ID || '';

const INTRO_CHANNEL_ID = process.env.INTRO_CHANNEL_ID || '';
const RULES_CHANNEL_ID = process.env.RULES_CHANNEL_ID || '';

const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID || '';

const memberJoin: Event = {
  name: 'guildMemberAdd',
  execute: async (_client, member: GuildMember) => {
    // Assign role
    if (AUTO_ROLE_ID && member.guild.roles.cache.has(AUTO_ROLE_ID)) {
      try {
        await member.roles.add(AUTO_ROLE_ID);
      } catch (err) {
        // Optionally log error
      }
    }
    // Send themed welcome message
    if (WELCOME_CHANNEL_ID) {
      const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
      if (channel && channel.isTextBased && channel.isTextBased()) {
        await (channel as any).send(
          `🚀 Welcome to **${member.guild.name}** — the hub for cyber security and IT enthusiasts!\n\n` +
          `👋 <@${member.id}>, we’re excited to have you join our community of learners, professionals, and tech explorers.\n\n` +
          `**Get started:**\n` +
          `- Read the <#${RULES_CHANNEL_ID || 'rules-channel-id'}> and introduce yourself in <#${INTRO_CHANNEL_ID || 'introductions-channel-id'}>.\n` +
          `- Ask questions, share resources, and help others grow.\n` +
          `- Stay safe, stay curious, and have fun!`
        );
      }
    }
    // Log member join
    if (LOG_CHANNEL_ID) {
      const logChannel = member.guild.channels.cache.get(LOG_CHANNEL_ID);
      if (logChannel && logChannel.isTextBased && logChannel.isTextBased()) {
        await (logChannel as any).send(
          `✅ **Member joined:** <@${member.id}> (${member.user.tag})`);
      }
    }
  }
};

export default memberJoin; 