import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import { config } from '../../config';

const TENOR_KEY = 'LIVDSRZULELA'; // Tenor public demo key

type TenorGifResult = {
  media_formats: {
    gif: {
      url: string;
    }
  }
};

type TenorApiResponse = {
  results: TenorGifResult[];
};

const gif: Command = {
  options: {
    name: 'gif',
    description: 'Search and post a GIF from Tenor.',
    category: 'fun',
    usage: 'gif [search]',
    examples: ['gif cat', 'gif dance', 'gif']
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message) return;
    try {
      const search = args && args.length > 0 ? args.join(' ') : '';
      const url = search
        ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(search)}&key=${TENOR_KEY}&limit=1&media_filter=gif` 
        : `https://tenor.googleapis.com/v2/featured?key=${TENOR_KEY}&limit=1&media_filter=gif`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API error');
      const data = await res.json() as TenorApiResponse;
      const gifUrl = data.results && data.results[0]?.media_formats?.gif?.url;
      if (!gifUrl) throw new Error('No gif found');
      const defaultColor = (config.embedColor as string) || '#2d0036';
      const embed = new EmbedBuilder()
        .setColor(defaultColor as any)
        .setTitle('GIF')
        .setImage(gifUrl)
        .setFooter({ text: search ? `Search: ${search}` : 'Trending GIF' });
      await message.reply({ embeds: [embed] });
    } catch (err) {
      await message.reply('😢 Could not fetch a gif right now. Try again later!');
    }
  }
};
export default gif; 