import { Command, CommandExecuteOptions } from '../../types/command';
import { moveToEscrow } from '../../db/database';
import { sendLogToChannel } from '../../utils/logger';

const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID || 'ADMIN_ROLE_ID'; // Set your admin role ID in .env
const symbols = ['🍒', '🍋', '🍉', '🍇', '🔔', '⭐', '7️⃣'];

const slots: Command = {
  options: {
    name: 'slots',
    description: 'Spin the slots and bet coins.',
    usage: '/slots <amount>',
    category: 'utility',
  },
  execute: async ({ client, message, args }: CommandExecuteOptions) => {
    if (!message) return;
    if (!args || args.length < 1) {
      await message.reply('Usage: !slots <amount>');
      return;
    }
    const amount = parseInt(args[0], 10);
    if (isNaN(amount) || amount <= 0) {
      await message.reply('Please provide a valid amount to bet.');
      return;
    }
    // Slot spin logic
    const spin = () => [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)]
    ];
    const result = spin();
    const win = result[0] === result[1] && result[1] === result[2];
    let msg = `🎰 | ${result.join(' | ')} | 🎰\n`;
    try {
      if (win) {
        moveToEscrow(message.author.id, amount * 3, 'Slots payout');
        msg += `You won! You would receive ${amount * 3} coins (payout pending admin approval).`;
      } else {
        moveToEscrow(message.author.id, amount, 'Slots bet');
        msg += `You lost your bet of ${amount} coins. (Bet is escrowed, pending admin approval)`;
      }
      msg += '\nYour result is now in escrow and pending admin review.';
      await message.reply(msg);
      // Log to channel and @mention admin role
      const logMsg = `[SLOTS] User ${message.author.tag} (${message.author.id}) spun ${result.join(' | ')}. Win: ${win}. Bet: ${amount}.\n[ESCROW] Escrow created for this spin.\n<@&${ADMIN_ROLE_ID}> Please review this transaction for safety.`;
      await sendLogToChannel(client, logMsg);
    } catch (err: any) {
      await message.reply(`Slots bet failed: ${err.message}`);
      // Log failure
      const logMsg = `[SLOTS-FAILED] User ${message.author.tag} (${message.author.id}) tried to bet ${amount} coins.\nReason: ${err.message}\n<@&${ADMIN_ROLE_ID}>`;
      await sendLogToChannel(client, logMsg);
    }
  }
};

export default slots; 