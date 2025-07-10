import { Command, CommandExecuteOptions } from '../../types/command';
import { moveToEscrow } from '../../db/database';
import { sendLogToChannel } from '../../utils/logger';

const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID || 'ADMIN_ROLE_ID'; // Set your admin role ID in .env

const gamble: Command = {
  options: {
    name: 'gamble',
    description: 'Bet coins for a chance to win.',
    usage: '/gamble <amount>',
    category: 'utility',
  },
  execute: async ({ client, message, args }: CommandExecuteOptions) => {
    if (!message) return;
    if (!args || args.length < 1) {
      await message.reply('Usage: /gamble <amount>');
      return;
    }
    const amount = parseInt(args[0], 10);
    if (isNaN(amount) || amount <= 0) {
      await message.reply('Please provide a valid amount to gamble.');
      return;
    }
    // Gameplay logic: 50% chance to win double, 50% chance to lose
    const win = Math.random() < 0.5;
    let msg = '';
    try {
      if (win) {
        moveToEscrow(message.author.id, amount * 2, 'Gamble payout');
        msg = `🎉 You won! You would receive ${amount * 2} coins (payout pending admin approval).`;
      } else {
        moveToEscrow(message.author.id, amount, 'Gamble bet');
        msg = `😢 You lost your bet of ${amount} coins. (Bet is escrowed, pending admin approval)`;
      }
      msg += '\nYour result is now in escrow and pending admin review.';
      await message.reply(msg);
      // Log to channel and @mention admin role
      const logMsg = `[GAMBLE] User ${message.author.tag} (${message.author.id}) bet ${amount} coins. Win: ${win}.\n[ESCROW] Escrow created for this bet.\n<@&${ADMIN_ROLE_ID}> Please review this transaction for safety.`;
      await sendLogToChannel(client, logMsg);
    } catch (err: any) {
      await message.reply(`Gamble failed: ${err.message}`);
      // Log failure
      const logMsg = `[GAMBLE-FAILED] User ${message.author.tag} (${message.author.id}) tried to bet ${amount} coins.\nReason: ${err.message}\n<@&${ADMIN_ROLE_ID}>`;
      await sendLogToChannel(client, logMsg);
    }
  }
};

export default gamble; 