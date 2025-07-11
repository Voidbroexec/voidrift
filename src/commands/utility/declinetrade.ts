import { Command, CommandExecuteOptions } from '../../types/command';
import { pendingTrades } from './trade';

const declinetrade: Command = {
  options: {
    name: 'declinetrade',
    description: 'Decline a VCoins trade proposal.',
    category: 'utility',
    usage: '/declinetrade'
  },
  execute: async ({ message }: CommandExecuteOptions) => {
    if (!message) return;
    const trade = pendingTrades[message.author.id];
    if (!trade) {
      await message.reply('You have no pending trades.');
      return;
    }
    delete pendingTrades[message.author.id];
    await message.reply('Trade declined. No VCoins were transferred.');
  }
};

export default declinetrade; 