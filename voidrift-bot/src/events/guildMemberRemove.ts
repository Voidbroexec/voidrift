import { GuildMember } from 'discord.js';
import { Event } from '../types/command';

// Use a separate goodbye channel if set, otherwise fallback to welcome channel
const GOODBYE_CHANNEL_ID = process.env.GOODBYE_CHANNEL_ID || process.env.WELCOME_CHANNEL_ID || '';
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID || '';

const guildMemberRemove: Event = {
  name: 'guildMemberRemove',
  execute: async (_client, member: GuildMember) => {
    if (GOODBYE_CHANNEL_ID) {
      const channel = member.guild.channels.cache.get(GOODBYE_CHANNEL_ID);
      if (channel && channel.isTextBased && channel.isTextBased()) {
        await (channel as any).send(
          `🔒 **${member.guild.name}**: <@${member.id}> has left the network.\n\n` +
          `We hope you found value in our DevSecOps community. Stay secure out there!`
        );
      }
    }
    // Log member leave
    if (LOG_CHANNEL_ID) {
      const logChannel = member.guild.channels.cache.get(LOG_CHANNEL_ID);
      if (logChannel && logChannel.isTextBased && logChannel.isTextBased()) {
        await (logChannel as any).send(
          `🚪 **Member left:** <@${member.id}> (${member.user.tag})`);
      }
    }
  }
};

export default guildMemberRemove; 