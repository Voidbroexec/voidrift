import { Message } from 'discord.js';
import { Event } from '../types/command';
import { VoidriftClient } from '../client';
import { addSnipe } from '../utils/snipeStore';

const messageDelete: Event = {
  name: 'messageDelete',
  execute: async (_client: VoidriftClient, message: Message) => {
    if (message.partial || !message.content) return;
    addSnipe(message.channelId, message.content, message.author.tag);
  }
};

export default messageDelete;
