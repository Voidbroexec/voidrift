import { Command, CommandExecuteOptions } from '../../types/command';
import { moveToEscrow } from '../../db/database';
import { sendLogToChannel } from '../../utils/logger';

const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID || 'ADMIN_ROLE_ID'; // Set your admin role ID in .env

const coinflip: Command = {
  options: {
    name: 'coinflip',
    description: 'Flip a coin and bet coins.',
    usage: '/coinflip <amount> <heads|tails>',
    category: 'utility',
  },
  execute: async ({ client, message, args }: CommandExecuteOptions) => {
    if (!message) return;
    if (!args || args.length < 2) {
      await message.reply('Usage: /coinflip <amount> <heads|tails>');
      return;
    }
    const amount = parseInt(args[0], 10);
    const side = args[1]?.toLowerCase();
    if (isNaN(amount) || amount <= 0 || (side !== 'heads' && side !== 'tails')) {
      await message.reply('Please provide a valid amount and choose heads or tails.');
      return;
    }
    // Gameplay logic: random heads/tails
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const win = side === result;
    let msg = `🪙 The coin landed on **${result}**!\n`;
    try {
      if (win) {
        moveToEscrow(message.author.id, amount * 2, 'Coinflip payout');
        msg += `You won! You would receive ${amount * 2} coins (payout pending admin approval).`;
      } else {
        moveToEscrow(message.author.id, amount, 'Coinflip bet');
        msg += `You lost your bet of ${amount} coins. (Bet is escrowed, pending admin approval)`;
      }
      msg += '\nYour result is now in escrow and pending admin review.';
      await message.reply(msg);
      // Log to channel and @mention admin role
      const logMsg = `[COINFLIP] User ${message.author.tag} (${message.author.id}) bet ${amount} coins on ${side}. Result: ${result}. Win: ${win}.\n[ESCROW] Escrow created for this bet.\n<@&${ADMIN_ROLE_ID}> Please review this transaction for safety.`;
      await sendLogToChannel(client, logMsg);
    } catch (err: any) {
      await message.reply(`Coinflip bet failed: ${err.message}`);
      // Log failure
      const logMsg = `[COINFLIP-FAILED] User ${message.author.tag} (${message.author.id}) tried to bet ${amount} coins on ${side}.\nReason: ${err.message}\n<@&${ADMIN_ROLE_ID}>`;
      await sendLogToChannel(client, logMsg);
    }
  }
};

export default coinflip; 