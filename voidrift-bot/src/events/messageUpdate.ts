import { Message } from 'discord.js';
import { Event } from '../types/command';

const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID || '';

const messageUpdate: Event = {
  name: 'messageUpdate',
  execute: async (_client, oldMessage: Message, newMessage: Message) => {
    if (!LOG_CHANNEL_ID) return;
    if (!oldMessage.guild) return;
    if (oldMessage.partial || newMessage.partial) return;
    if (oldMessage.content === newMessage.content) return;
    const channel = oldMessage.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (channel && channel.isTextBased && channel.isTextBased()) {
      await (channel as any).send(
        `✏️ **Message edited in <#${oldMessage.channel.id}> by <@${oldMessage.author?.id}>**\n` +
        `**Before:** ${oldMessage.content}\n` +
        `**After:** ${newMessage.content}`
      );
    }
  }
};

export default messageUpdate; 