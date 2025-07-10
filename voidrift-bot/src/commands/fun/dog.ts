import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import { config } from '../../config';

const dog: Command = {
  options: {
    name: 'dog',
    description: 'Send a random dog picture.',
    category: 'fun',
  },
  execute: async ({ message }: CommandExecuteOptions) => {
    if (!message) return;
    try {
      const res = await fetch('https://dog.ceo/api/breeds/image/random');
      if (!res.ok) throw new Error('API error');
      const data = await res.json() as { message: string };
      if (!data.message) throw new Error('No dog found');
      const defaultColor = (config.embedColor as string) || '#2d0036';
      const embed = new EmbedBuilder()
        .setColor(defaultColor as any)
        .setTitle('🐶 Woof!')
        .setImage(data.message);
      await message.reply({ embeds: [embed] });
    } catch (err) {
      await message.reply('🐶 Could not fetch a dog right now. Try again later!');
    }
  }
};
export default dog; 