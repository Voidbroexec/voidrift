import { Command, CommandExecuteOptions } from '../../types/command';
import { getBalance } from '../../utils/economyStore';

const balance: Command = {
  options: {
    name: 'balance',
    description: 'Check your balance or another user\'s VCoins balance.',
    category: 'utility',
    usage: '/balance [@user]',
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message) return;
    let user = message.author;
    if (args && args.length > 0 && message.mentions.users.size > 0) {
      user = message.mentions.users.first()!;
    }
    const bal = getBalance(user.id);
    await message.reply(`${user.tag} has 🪙 ${bal} VCoins.`);
  }
};

export default balance; 