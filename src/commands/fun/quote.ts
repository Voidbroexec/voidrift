import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import { config } from '../../config';

type QuoteApiResponse = {
  content: string;
  author: string;
};

const quote: Command = {
  options: {
    name: 'quote',
    description: 'Get a random inspirational or funny quote.',
    category: 'fun',
  },
  execute: async ({ message }: CommandExecuteOptions) => {
    if (!message) return;
    try {
      const res = await fetch('https://api.quotable.io/random');
      if (!res.ok) throw new Error('API error');
      const data = await res.json() as QuoteApiResponse;
      if (!data.content) throw new Error('No quote found');
      const defaultColor = (config.embedColor as string) || '#2d0036';
      const embed = new EmbedBuilder()
        .setColor(defaultColor as any)
        .setTitle('💬 Quote')
        .setDescription(`"${data.content}"`)
        .setFooter({ text: `— ${data.author}` });
      await message.reply({ embeds: [embed] });
    } catch (err) {
      await message.reply('💬 Could not fetch a quote right now. Try again later!');
    }
  }
};
export default quote; 