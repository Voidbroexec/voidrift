// getTopBalances is now SQLite-based. You can import from either db/database or utils/economyStore for compatibility.
import { Command, CommandExecuteOptions } from '../../types/command';
import { getTopXp } from '../../utils/xpStore';

const leaderboard: Command = {
  options: {
    name: 'leaderboard',
    description: 'Show the top XP users.',
    category: 'community',
    usage: '/leaderboard'
  },
  execute: async ({ message, interaction }: CommandExecuteOptions) => {
    const user = message?.author || interaction?.user;
    if (!user) return;
    const top = getTopXp(10);
    let reply = '**XP Leaderboard:**\n';
    for (let i = 0; i < top.length; i++) {
      reply += `#${i + 1}: <@${top[i].user_id}> — ${top[i].xp} XP (Level ${top[i].level})\n`;
    }
    if (message) {
      await message.reply(reply);
    } else if (interaction) {
      await interaction.reply({ content: reply, ephemeral: true });
    }
  }
};

export default leaderboard; 