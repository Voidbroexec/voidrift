import { Command, CommandExecuteOptions } from '../../types/command';
import { getTopBalances } from '../../utils/economyStore';

const leaderboard: Command = {
  options: {
    name: 'vc-leaderboard',
    description: 'Show the top users by VCoins.',
    category: 'utility',
    usage: '/vc-leaderboard'
  },
  execute: async ({ message }: CommandExecuteOptions) => {
    if (!message || !message.guild) return;
    const top = getTopBalances(10);
    if (top.length === 0) {
      await message.reply('No one has any VCoins yet!');
      return;
    }
    const lines = await Promise.all(top.map(async ([userId, bal], i) => {
      try {
        const user = await message.guild!.members.fetch(userId);
        return `#${i+1} - ${user.user.tag}: 🪙 ${bal} VCoins`;
      } catch {
        return `#${i+1} - Unknown User (${userId}): 🪙 ${bal} VCoins`;
      }
    }));
    await message.reply('🏆 **Top 10 Richest Users:**\n' + lines.join('\n'));
  }
};

export default leaderboard; 