import { Command, CommandExecuteOptions } from '../../types/command';
let startTime = Date.now();
const uptime: Command = {
  options: {
    name: 'uptime',
    description: 'Show how long the bot has been running.',
    category: 'utility',
    usage: '/uptime'
  },
  execute: async ({ message, client }: CommandExecuteOptions) => {
    if (!message) return;
    const ms = Date.now() - startTime;
    const sec = Math.floor((ms / 1000) % 60);
    const min = Math.floor((ms / (1000 * 60)) % 60);
    const hr = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    await message.reply(`Uptime: ${days}d ${hr}h ${min}m ${sec}s`);
  }
};
export default uptime; 