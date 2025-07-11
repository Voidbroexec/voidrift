import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import { config } from '../../config';

const cat: Command = {
  options: {
    name: 'cat',
    description: 'Send a random cat picture.',
    category: 'fun',
  },
  execute: async ({ message }: CommandExecuteOptions) => {
    if (!message) return;
    try {
      const res = await fetch('https://api.thecatapi.com/v1/images/search');
      if (!res.ok) throw new Error('API error');
      const data = await res.json() as { url: string }[];
      if (!data[0] || !data[0].url) throw new Error('No cat found');
      const defaultColor = (config.embedColor as string) || '#2d0036';
      const embed = new EmbedBuilder()
        .setColor(defaultColor as any)
        .setTitle('🐱 Meow!')
        .setImage(data[0].url);
      await message.reply({ embeds: [embed] });
    } catch (err) {
      await message.reply('😿 Could not fetch a cat right now. Try again later!');
    }
  }
};
export default cat; 