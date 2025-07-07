import { Message } from 'discord.js';
import { Event } from '../types/command';
import { VoidriftClient } from '../client';
import { automationConfig } from '../utils/automationConfig';

const automation: Event = {
  name: 'messageCreate',
  execute: async (client: VoidriftClient, message: Message) => {
    if (!client.user) return;
    if (automationConfig.stealth) return;

    // Smart DND Auto-Responder
    if (client.user.presence?.status === 'dnd') {
      const isDM = message.channel.isDMBased();
      const mentionsBot = message.mentions.has(client.user);
      if ((isDM || mentionsBot) && message.author.id !== client.user.id) {
        try {
          await message.reply(automationConfig.dndMessage);
        } catch {
          // ignore
        }
      }
    }

    // Auto Emoji Reaction for Dry Text
    if (message.author.id === client.user.id) {
      const content = message.content.toLowerCase().trim();
      if (automationConfig.dryTriggers.includes(content)) {
        try {
          await message.react(automationConfig.dryEmoji);
        } catch {
          // ignore
        }
      }
    }

    // Per-user triggers
    const trigger = automationConfig.userTriggers[message.author.id];
    if (trigger && message.author.id !== client.user.id) {
      if (trigger.autoReply) {
        try {
          await message.reply(trigger.autoReply);
        } catch {
          // ignore
        }
      }
      if (trigger.reactEmoji) {
        try {
          await message.react(trigger.reactEmoji);
        } catch {
          // ignore
        }
      }
    }
  }
};

export default automation;
