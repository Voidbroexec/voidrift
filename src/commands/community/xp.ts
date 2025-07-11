import { Command, CommandExecuteOptions } from '../../types/command';
import { getXp, getLevel } from '../../utils/xpStore';

const xp: Command = {
  options: {
    name: 'xp',
    description: 'Show your XP and level.',
    category: 'community',
    usage: '/xp'
  },
  execute: async ({ message, interaction }: CommandExecuteOptions) => {
    const user = message?.author || interaction?.user;
    if (!user) return;
    const xp = getXp(user.id);
    const level = getLevel(user.id);
    const reply = `You have **${xp} XP** and are level **${level}**.`;
    if (message) {
      await message.reply(reply);
    } else if (interaction) {
      await interaction.reply({ content: reply, ephemeral: true });
    }
  }
};

export default xp; 