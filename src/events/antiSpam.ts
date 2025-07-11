import { Message } from 'discord.js';
import { Event } from '../types/command';

const SPAM_THRESHOLD = parseInt(process.env.SPAM_THRESHOLD || '5', 10); // messages
const SPAM_INTERVAL = parseInt(process.env.SPAM_INTERVAL || '7000', 10); // ms
const SPAM_TIMEOUT = parseInt(process.env.SPAM_TIMEOUT || '60', 10); // seconds

const userMessageTimestamps: Record<string, number[]> = {};

const antiSpam: Event = {
  name: 'messageCreate',
  execute: async (_client, message: Message) => {
    if (!message.guild || message.author.bot) return;
    const now = Date.now();
    const arr = userMessageTimestamps[message.author.id] || [];
    // Remove old timestamps
    const recent = arr.filter(ts => now - ts < SPAM_INTERVAL);
    recent.push(now);
    userMessageTimestamps[message.author.id] = recent;
    if (recent.length >= SPAM_THRESHOLD) {
      // Timeout user
      try {
        const member = await message.guild.members.fetch(message.author.id);
        if (member.moderatable) {
          await member.timeout(SPAM_TIMEOUT * 1000, 'Spamming messages');
          if (message.channel.isTextBased && message.channel.isTextBased()) {
            await (message.channel as any).send(`<@${message.author.id}> has been timed out for spamming.`);
          }
        }
      } catch {}
      userMessageTimestamps[message.author.id] = [];
    }
  }
};

export default antiSpam; 