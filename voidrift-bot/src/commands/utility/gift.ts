import { Command, CommandExecuteOptions } from '../../types/command';
import { moveToEscrow } from '../../db/database';
import { sendLogToChannel } from '../../utils/logger';

const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID || 'ADMIN_ROLE_ID'; // Set your admin role ID in .env

const gift: Command = {
  options: {
    name: 'gift',
    description: 'Gift coins to another user.',
    usage: '/gift <@user> <amount> <reason>',
    category: 'utility',
  },
  execute: async ({ client, message, args }: CommandExecuteOptions) => {
    if (!message) return;
    if (!args || args.length < 3) {
      await message.reply('Usage: /gift <@user> <amount> <reason>');
      return;
    }
    const target = message.mentions.users.first();
    const amount = parseInt(args[1], 10);
    const reason = args.slice(2).join(' ').trim();
    if (!target || isNaN(amount) || amount <= 0 || !reason) {
      await message.reply('Please mention a valid user, amount, and reason.');
      return;
    }
    if (target.id === message.author.id) {
      await message.reply('You cannot gift to yourself.');
      return;
    }
    // Escrow and safety check
    try {
      moveToEscrow(message.author.id, amount, `Gift to ${target.tag} (${target.id}): ${reason}`);
      await message.reply(`Your gift of ${amount} coins to ${target.tag} for "${reason}" is now in escrow and pending admin review.`);
      // Log to channel and @mention admin role
      const logMsg = `[GIFT] User ${message.author.tag} (${message.author.id}) gifted ${amount} coins to ${target.tag} (${target.id}) for "${reason}".\n[ESCROW] Escrow created for this gift.\n<@&${ADMIN_ROLE_ID}> Please review this transaction for safety.`;
      await sendLogToChannel(client, logMsg);
    } catch (err: any) {
      await message.reply(`Gift failed: ${err.message}`);
      // Log failure
      const logMsg = `[GIFT-FAILED] User ${message.author.tag} (${message.author.id}) tried to gift ${amount} coins to ${target ? target.tag : 'unknown'} (${target ? target.id : 'unknown'}) for "${reason}".\nReason: ${err.message}\n<@&${ADMIN_ROLE_ID}>`;
      await sendLogToChannel(client, logMsg);
    }
  }
};

export default gift; 