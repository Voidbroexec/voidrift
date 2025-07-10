import { Command, CommandExecuteOptions } from '../../types/command';
import { moveToEscrow } from '../../db/database';
import { sendLogToChannel } from '../../utils/logger';

const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID || 'ADMIN_ROLE_ID'; // Set your admin role ID in .env

const bet: Command = {
  options: {
    name: 'bet',
    description: 'Place a bet.',
    usage: '/bet <amount> <description>',
    category: 'utility',
  },
  execute: async ({ client, message, args }: CommandExecuteOptions) => {
    if (!message) return;
    if (!args || args.length < 2) {
      await message.reply('Usage: /bet <amount> <description>');
      return;
    }
    const amount = parseInt(args[0], 10);
    const description = args.slice(1).join(' ').trim();
    if (isNaN(amount) || amount <= 0 || !description) {
      await message.reply('Please provide a valid amount and description for your bet.');
      return;
    }
    // Escrow and safety check
    try {
      moveToEscrow(message.author.id, amount, `Bet: ${description}`);
      await message.reply(`Your bet of ${amount} coins (${description}) is now in escrow and pending admin review.`);
      // Log to channel and @mention admin role
      const logMsg = `[BET] User ${message.author.tag} (${message.author.id}) placed a bet of ${amount} coins (${description}).\n[ESCROW] Escrow created for this bet.\n<@&${ADMIN_ROLE_ID}> Please review this transaction for safety.`;
      await sendLogToChannel(client, logMsg);
    } catch (err: any) {
      await message.reply(`Bet failed: ${err.message}`);
      // Log failure
      const logMsg = `[BET-FAILED] User ${message.author.tag} (${message.author.id}) tried to bet ${amount} coins (${description}).\nReason: ${err.message}\n<@&${ADMIN_ROLE_ID}>`;
      await sendLogToChannel(client, logMsg);
    }
  }
};

export default bet; 