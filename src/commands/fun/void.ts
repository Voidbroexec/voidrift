import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import { config } from '../../config';

const TENOR_KEY = 'LIVDSRZULELA'; // Tenor public demo key
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const VIMEO_ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

const voidCmd: Command = {
  options: {
    name: 'void',
    description: 'Fetches images, gifs, memes, videos, or text search results based on your query.',
    category: 'fun',
    usage: '/void [type] <query>',
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message || !args || args.length === 0) {
      await message?.reply('Usage: !void [type] <query>');
      return;
    }
    let type = 'image';
    let query = args.join(' ');
    const first = args[0].toLowerCase();
    if (["pic","image","img","gif","meme","text","vid","video"].includes(first)) {
      type = first;
      query = args.slice(1).join(' ');
    }
    const defaultColor = (config.embedColor as string) || '#2d0036';
    try {
      // GIF SEARCH (Tenor, fallback to Meme API)
      if (type === 'gif') {
        let gifUrl = null;
        // Try Tenor if key present
        if (TENOR_KEY) {
          try {
            const url = `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${TENOR_KEY}&limit=1&media_filter=gif`;
            const res = await fetch(url);
            const data = await res.json() as any;
            gifUrl = data.results && data.results[0]?.media_formats?.gif?.url;
          } catch {}
        }
        // Fallback to Meme API gif
        if (!gifUrl) {
          try {
            const res = await fetch('https://meme-api.com/gimme');
            const data = await res.json() as any;
            gifUrl = data.preview?.[0] || data.url;
          } catch {}
        }
        if (gifUrl) {
          const embed = new EmbedBuilder().setColor(defaultColor as any).setTitle('GIF').setImage(gifUrl).setFooter({ text: query });
          await message.reply({ embeds: [embed] });
          return;
        }
      }
      // MEME SEARCH (Meme API, fallback to DuckDuckGo image)
      if (type === 'meme') {
        let memeUrl = null;
        try {
          const res = await fetch('https://meme-api.com/gimme');
          const data = await res.json() as any;
          memeUrl = data.url;
        } catch {}
        // Fallback to DuckDuckGo image
        if (!memeUrl) {
          try {
            const ddgRes = await fetch(`https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}`);
            const ddgData = await ddgRes.json() as any;
            memeUrl = ddgData.results?.[0]?.image;
          } catch {}
        }
        if (memeUrl) {
          const embed = new EmbedBuilder().setColor(defaultColor as any).setTitle('Meme').setImage(memeUrl).setFooter({ text: query });
          await message.reply({ embeds: [embed] });
          return;
        }
      }
      // IMAGE SEARCH (DuckDuckGo, fallback to Unsplash if key, else Pexels if key)
      if (type === 'pic' || type === 'image' || type === 'img') {
        let imgUrl = null;
        // DuckDuckGo free image search
        try {
          const ddgRes = await fetch(`https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}`);
          const ddgData = await ddgRes.json() as any;
          imgUrl = ddgData.results?.[0]?.image;
        } catch {}
        // Fallback to Unsplash if key
        if (!imgUrl && UNSPLASH_KEY) {
          try {
            const unsplashRes = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_KEY}&per_page=1`);
            if (unsplashRes.ok) {
              const unsplashData = await unsplashRes.json() as any;
              imgUrl = unsplashData.results?.[0]?.urls?.regular;
            }
          } catch {}
        }
        // Fallback to Pexels if key
        if (!imgUrl && PEXELS_API_KEY) {
          try {
            const pexelsRes = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
              headers: { Authorization: PEXELS_API_KEY }
            });
            if (pexelsRes.ok) {
              const pexelsData = await pexelsRes.json() as any;
              imgUrl = pexelsData.photos?.[0]?.src?.original;
            }
          } catch {}
        }
        if (imgUrl) {
          const embed = new EmbedBuilder().setColor(defaultColor as any).setTitle(query).setImage(imgUrl);
          await message.reply({ embeds: [embed] });
          return;
        }
      }
      // VIDEO SEARCH (DuckDuckGo text, fallback to YouTube if key)
      if (type === 'vid' || type === 'video') {
        let videoUrl = null;
        // DuckDuckGo text search for video links
        try {
          const ddgRes = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query + ' site:youtube.com')}&format=json&no_redirect=1&no_html=1`);
          const ddgData = await ddgRes.json() as any;
          videoUrl = ddgData.RelatedTopics?.[0]?.FirstURL || ddgData.AbstractURL;
        } catch {}
        // Fallback to YouTube API if key
        if (!videoUrl && YOUTUBE_API_KEY) {
          try {
            const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`);
            const ytData = await ytRes.json() as any;
            videoUrl = ytData.items?.[0] ? `https://youtube.com/watch?v=${ytData.items[0].id.videoId}` : null;
          } catch {}
        }
        if (videoUrl) {
          await message.reply(videoUrl);
          return;
        }
      }
      // TEXT SEARCH (DuckDuckGo, Wikipedia, dictionaryapi.dev)
      if (type === 'text') {
        // DuckDuckGo
        try {
          const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`);
          const data = await res.json() as any;
          let answer = data.AbstractText || data.Answer || data.RelatedTopics?.[0]?.Text;
          if (answer && answer.length > 0) {
            if (answer.length > 1800) answer = answer.slice(0, 1800) + '...';
            await message.reply(`**${query}**\n${answer}`);
            return;
          }
        } catch {}
        // Wikipedia
        try {
          const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
          if (wikiRes.ok) {
            const wikiData = await wikiRes.json() as any;
            if (wikiData.extract) {
              await message.reply(`**${wikiData.title}**\n${wikiData.extract}`);
              return;
            }
          }
        } catch {}
        // dictionaryapi.dev
        try {
          const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(query)}`);
          if (dictRes.ok) {
            const dictData = await dictRes.json() as any;
            const meanings = dictData[0]?.meanings?.[0]?.definitions?.[0]?.definition;
            if (meanings) {
              await message.reply(`**${query}:** ${meanings}`);
              return;
            }
          }
        } catch {}
        await message.reply(`**${query}**\nNo answer found.`);
        return;
      }
      await message.reply('❌ Could not fetch result. Try again later!');
    } catch (err) {
      console.error('!void command error:', err);
      await message.reply('❌ Could not fetch result. Try again later!');
    }
  }
};
export default voidCmd; 