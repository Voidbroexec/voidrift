import { Command } from '../../types/command';
import { getBalance, subtractBalance, addBalance } from '../../utils/economyStore';
import { pendingTrades } from './trade';

const accepttrade: Command = {
  options: {
    name: 'accepttrade',
    description: 'Accept a VCoins trade proposal.',
    category: 'utility',
    usage: '/accepttrade'
  },
  execute: async ({ message }) => {
    if (!message) return;
    const trade = pendingTrades[message.author.id];
    if (!trade) {
      await message.reply('You have no pending trades.');
      return;
    }
    if (getBalance(trade.from) < trade.amount) {
      await message.reply('The sender does not have enough VCoins. Trade cancelled.');
      delete pendingTrades[message.author.id];
      return;
    }
    subtractBalance(trade.from, trade.amount);
    addBalance(trade.to, trade.amount);
    await message.reply(`Trade accepted! 🪙 VCoins have been transferred.`);
    delete pendingTrades[message.author.id];
  }
};

export default accepttrade; 