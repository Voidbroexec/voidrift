import { Command, CommandExecuteOptions } from '../../types/command';
import { config } from '../../config';
import { getBalance, subtractBalance } from '../../utils/economyStore';

const SHOP_ITEMS = [
  { name: 'VIP Role', price: 1000, description: 'Grants a special VIP role.' },
  { name: 'Custom Emoji', price: 500, description: 'Unlocks a custom emoji for you.' },
  { name: 'Profile Flair', price: 250, description: 'Adds a flair to your profile.' }
];

const shop: Command = {
  options: {
    name: 'shop',
    description: 'View items available for purchase with VCoins.',
    category: 'utility',
    usage: '/shop',
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message) return;
    if (!args || args.length === 0) {
      let reply = '**🛒 Shop Items:**\n';
      SHOP_ITEMS.forEach((item: any, i: number) => {
        reply += `**${item.name}** - 🪙 ${item.price} VCoins\n${item.description}\n`;
      });
      reply += '\nUse `!buy <item>` to purchase.';
      await message.reply(reply);
      return;
    }
    // Buying logic
    if (args[0].toLowerCase() === 'buy' && args[1]) {
      const itemName = args.slice(1).join(' ');
      const item = SHOP_ITEMS.find(i => i.name.toLowerCase() === itemName.toLowerCase());
      if (!item) {
        await message.reply('Item not found. Use `!shop` to view available items.');
        return;
      }
      const bal = getBalance(message.author.id);
      if (bal < item.price) {
        await message.reply('You do not have enough VCoins for this purchase.');
        return;
      }
      subtractBalance(message.author.id, item.price);
      await message.reply(`You bought **${item.name}** for 🪙 ${item.price} VCoins!`);
      // TODO: Grant item (role, emoji, etc.)
    }
  }
};

export default shop; 