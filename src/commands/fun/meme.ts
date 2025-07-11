import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import { config } from '../../config';

type MemeApiResponse = {
  url: string;
  title: string;
  postLink: string;
  subreddit: string;
};

const meme: Command = {
  options: {
    name: 'meme',
    description: 'Fetch a random meme from Reddit.',
    category: 'fun',
  },
  execute: async ({ message }: CommandExecuteOptions) => {
    if (!message) return;
    try {
      const res = await fetch('https://meme-api.com/gimme');
      if (!res.ok) throw new Error('API error');
      const data = await res.json() as MemeApiResponse;
      if (!data || !data.url) throw new Error('No meme found');
      const defaultColor = (config.embedColor as string) || '#2d0036';
      const embed = new EmbedBuilder()
        .setColor(defaultColor as any)
        .setTitle(data.title || 'Meme')
        .setURL(data.postLink)
        .setImage(data.url)
        .setFooter({ text: `From r/${data.subreddit}` });
      await message.reply({ embeds: [embed] });
    } catch (err) {
      await message.reply('😢 Could not fetch a meme right now. Try again later!');
    }
  }
};
export default meme; 