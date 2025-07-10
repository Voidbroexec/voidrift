import { Command, CommandExecuteOptions } from '../../types/command';
import { setAFK, clearAFK, isAFK } from '../../utils/afkStore';

const afk: Command = {
  options: {
    name: 'afk',
    description: 'Set your AFK (away from keyboard) status with an optional reason.',
    category: 'utility',
    usage: '/afk [reason]'
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message) return;
    const reason = args?.join(' ') || 'AFK';
    setAFK(message.author.id, reason);
    await message.reply(`You are now AFK: ${reason}`);
  }
};

export default afk; 