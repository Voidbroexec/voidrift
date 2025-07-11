import { Command, CommandExecuteOptions } from '../../types/command';
import axios from 'axios';

const translate: Command = {
  options: {
    name: 'translate',
    description: 'Translate text to another language.',
    category: 'utility',
    usage: '/translate <lang> <text>'
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message) return;
    const [lang, ...textArr] = args || [];
    if (!lang || textArr.length === 0) {
      await message.reply('Usage: /translate <lang> <text>');
      return;
    }
    const text = textArr.join(' ');
    try {
      const res = await axios.post('https://libretranslate.de/translate', {
        q: text,
        source: 'auto',
        target: lang,
        format: 'text'
      }, { headers: { 'accept': 'application/json' } });
      await message.reply(res.data.translatedText);
    } catch (err) {
      await message.reply('Failed to translate.');
    }
  }
};
export default translate; 