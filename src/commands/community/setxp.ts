import { Command, CommandExecuteOptions } from '../../types/command';
import { setLevel, addXp } from '../../utils/xpStore';
import { PermissionChecker } from '../../utils/permcheck';
import { Logger } from '../../utils/logger';

const setxp: Command = {
  options: {
    name: 'setxp',
    description: 'Admin: Set a user\'s XP or level. Usage: !setxp <@user> <xp|level> <amount>',
    category: 'community',
    usage: '/setxp <@user> xp 1000',
  },
  execute: async ({ message, args, interaction }: CommandExecuteOptions) => {
    const user = message?.author || interaction?.user;
    const member = message?.member || (interaction?.member as any);
    if (!user || !member) return;
    if (!PermissionChecker.isAdmin(user.id, member)) {
      if (message) {
        await message.reply('Only admins can use this command.');
      } else if (interaction) {
        await interaction.reply({ content: 'Only admins can use this command.', ephemeral: true });
      }
      return;
    }
    let targetUserId: string | undefined;
    let type: string | undefined;
    let amount: number | undefined;
    if (message) {
      if (!args || args.length < 3 || message.mentions.users.size === 0) {
        await message.reply('Usage: !setxp <@user> <xp|level> <amount>');
        return;
      }
      targetUserId = message.mentions.users.first()!.id;
      type = args[1];
      amount = parseInt(args[2], 10);
    } else if (interaction) {
      // For slash, parse from options (to be added in slash registration)
      // Example: /setxp user:<user> type:<xp|level> amount:<number>
      targetUserId = interaction.options.getUser('user')?.id;
      type = interaction.options.getString('type') || undefined;
      amount = interaction.options.getInteger('amount') || undefined;
    }
    if (!targetUserId || !type || typeof amount !== 'number' || isNaN(amount) || amount < 0) {
      if (message) {
        await message.reply('Usage: !setxp <@user> <xp|level> <amount>');
      } else if (interaction) {
        await interaction.reply({ content: 'Usage: /setxp user:<user> type:<xp|level> amount:<number>', ephemeral: true });
      }
      return;
    }
    if (type === 'xp') {
      addXp(targetUserId, amount);
      Logger.info(`Admin ${user.tag} set <@${targetUserId}>'s XP to ${amount}`);
      const reply = `Set <@${targetUserId}>'s XP to ${amount}.`;
      if (message) {
        await message.reply(reply);
      } else if (interaction) {
        await interaction.reply({ content: reply, ephemeral: true });
      }
    } else if (type === 'level') {
      setLevel(targetUserId, amount);
      Logger.info(`Admin ${user.tag} set <@${targetUserId}>'s level to ${amount}`);
      const reply = `Set <@${targetUserId}>'s level to ${amount}.`;
      if (message) {
        await message.reply(reply);
      } else if (interaction) {
        await interaction.reply({ content: reply, ephemeral: true });
      }
    } else {
      if (message) {
        await message.reply('Type must be "xp" or "level".');
      } else if (interaction) {
        await interaction.reply({ content: 'Type must be "xp" or "level".', ephemeral: true });
      }
    }
  }
};

export default setxp; 