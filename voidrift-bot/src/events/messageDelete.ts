import { Message } from 'discord.js';
import { Event } from '../types/command';
import { VoidriftClient } from '../client';
import { addSnipe } from '../utils/snipeStore';

const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID || '';

const messageDelete: Event = {
  name: 'messageDelete',
  execute: async (_client: VoidriftClient, message: Message) => {
    if (message.partial || !message.content) return;
    addSnipe(message.channelId, message.content, message.author.tag);
    // Log deleted message
    if (LOG_CHANNEL_ID && message.guild) {
      const channel = message.guild.channels.cache.get(LOG_CHANNEL_ID);
      if (channel && channel.isTextBased && channel.isTextBased()) {
        await (channel as any).send(
          `🗑️ **Message deleted in <#${message.channelId}> by <@${message.author?.id}>**\n` +
          `**Content:** ${message.content}`
        );
      }
    }
  }
};

export default messageDelete;
