import { Command, CommandExecuteOptions } from '../../types/command';
import { config } from '../../config';
import { getBalance, subtractBalance, addBalance } from '../../utils/economyStore';

let bankBalances: { [userId: string]: { amount: number, lastInterest: number } } = {};
const INTEREST_RATE = 0.01; // 1% per day

const bank: Command = {
  options: {
    name: 'bank',
    description: 'Deposit, withdraw, or check your VCoins bank balance.',
    category: 'utility',
    usage: '/bank deposit <amount> | /bank withdraw <amount> | /bank balance',
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message || !args || args.length === 0) {
      if (message) await message.reply('Usage: !bank deposit <amount> | !bank withdraw <amount> | !bank balance');
      return;
    }
    const userId = message.author.id;
    bankBalances[userId] = bankBalances[userId] || { amount: 0, lastInterest: Date.now() };
    // Apply interest if a day has passed
    const now = Date.now();
    const days = Math.floor((now - bankBalances[userId].lastInterest) / (1000 * 60 * 60 * 24));
    if (days > 0) {
      bankBalances[userId].amount += Math.floor(bankBalances[userId].amount * INTEREST_RATE * days);
      bankBalances[userId].lastInterest = now;
    }
    if (args[0].toLowerCase() === 'deposit' && args[1]) {
      const amount = parseInt(args[1], 10);
      if (isNaN(amount) || amount < 1) {
        await message.reply('Please specify a valid amount to deposit.');
        return;
      }
      if (getBalance(userId) < amount) {
        await message.reply('You do not have enough VCoins.');
        return;
      }
      subtractBalance(userId, amount);
      bankBalances[userId].amount += amount;
      await message.reply(`Deposited 🪙 ${amount} VCoins to your bank. Bank balance: 🪙 ${bankBalances[userId].amount} VCoins.`);
      return;
    }
    if (args[0].toLowerCase() === 'withdraw' && args[1]) {
      const amount = parseInt(args[1], 10);
      if (isNaN(amount) || amount < 1) {
        await message.reply('Please specify a valid amount to withdraw.');
        return;
      }
      if (bankBalances[userId].amount < amount) {
        await message.reply('You do not have enough VCoins in your bank.');
        return;
      }
      bankBalances[userId].amount -= amount;
      addBalance(userId, amount);
      await message.reply(`Withdrew 🪙 ${amount} VCoins from your bank. Bank balance: 🪙 ${bankBalances[userId].amount} VCoins.`);
      return;
    }
    if (args[0].toLowerCase() === 'balance') {
      await message.reply(`Your bank balance: 🪙 ${bankBalances[userId].amount} VCoins.`);
      return;
    }
    await message.reply('Invalid bank command. Use !bank deposit <amount>, !bank withdraw <amount>, or !bank balance.');
  }
};

export default bank; 