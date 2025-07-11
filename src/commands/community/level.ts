import { Command, CommandExecuteOptions } from '../../types/command';
import { getXp, getLevel } from '../../utils/xpStore';
import { getBalance, getLastDaily } from '../../utils/economyStore';

const level: Command = {
  options: {
    name: 'level',
    description: 'Show your level, XP, balance, and daily streak.',
    category: 'community',
    usage: '/level'
  },
  execute: async ({ message, interaction }: CommandExecuteOptions) => {
    const user = message?.author || interaction?.user;
    if (!user) return;
    const bal = getBalance(user.id);
    const lastDaily = getLastDaily(user.id);
    const now = Date.now();
    const streak = lastDaily && now - lastDaily < 48 * 60 * 60 * 1000 ? 1 : 0;
    const xp = getXp(user.id);
    const level = getLevel(user.id);
    const reply = `Level: **${level}**\nXP: **${xp}**\nBalance: 🪙 ${bal}\nDaily streak: ${streak}`;
    if (message) {
      await message.reply(reply);
    } else if (interaction) {
      await interaction.reply({ content: reply, ephemeral: true });
    }
  }
};
export default level; 