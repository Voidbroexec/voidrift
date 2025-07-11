import { Command, CommandExecuteOptions } from '../../types/command';
const birthdayMap = new Map();
const birthday: Command = {
  options: {
    name: 'birthday',
    description: 'Set your birthday for server-wide birthday wishes.',
    category: 'community',
    usage: '/birthday <MM-DD>',
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message) return;
    const date = args?.[0];
    if (!date || !/^\d{2}-\d{2}$/.test(date)) {
      await message.reply('Please provide your birthday in MM-DD format.');
      return;
    }
    birthdayMap.set(message.author.id, date);
    await message.reply(`Your birthday has been set to ${date}!`);
  }
};
export default birthday; 