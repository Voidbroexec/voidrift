import { Command, CommandExecuteOptions } from '../../types/command';
import axios from 'axios';
const define: Command = {
  options: {
    name: 'define',
    description: 'Get the dictionary definition of a word.',
    category: 'utility',
    usage: '/define <word>'
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message) return;
    const word = args?.[0];
    if (!word) {
      await message.reply('Usage: /define <word>');
      return;
    }
    try {
      const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      const meanings = res.data[0]?.meanings?.[0]?.definitions?.[0]?.definition;
      if (!meanings) {
        await message.reply('No definition found.');
        return;
      }
      await message.reply(`**${word}:** ${meanings}`);
    } catch (err) {
      await message.reply('Failed to fetch definition.');
    }
  }
};
export default define; 