import { Command, CommandExecuteOptions } from '../../types/command';
import { moveToEscrow } from '../../db/database';
import { sendLogToChannel } from '../../utils/logger';

const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID || 'ADMIN_ROLE_ID'; // Set your admin role ID in .env

// Shared pending trades object for accept/decline commands
export const pendingTrades: Record<string, { from: string, to: string, amount: number }> = {};

const trade: Command = {
  options: {
    name: 'trade',
    description: 'Propose a trade with another user.',
    usage: '/trade <@user> <amount> <item/description>',
    category: 'utility',
  },
  execute: async ({ client, message, args }: CommandExecuteOptions) => {
    if (!message) return;
    if (!args || args.length < 3) {
      await message.reply('Usage: !trade <@user> <amount> <item/description>');
      return;
    }
    const target = message.mentions.users.first();
    const amount = parseInt(args[1], 10);
    const item = args.slice(2).join(' ').trim();
    if (!target || isNaN(amount) || amount <= 0 || !item) {
      await message.reply('Please mention a valid user, amount, and item/description.');
      return;
    }
    if (target.id === message.author.id) {
      await message.reply('You cannot trade with yourself.');
      return;
    }
    // Escrow and safety check
    try {
      moveToEscrow(message.author.id, amount, `Trade with ${target.tag} (${target.id}): ${item}`);
      await message.reply(`Your trade proposal of ${amount} coins to ${target.tag} for "${item}" is now in escrow and pending admin review.`);
      // Log to channel and @mention admin role
      const logMsg = `[TRADE] User ${message.author.tag} (${message.author.id}) proposed a trade: ${amount} coins to ${target.tag} (${target.id}) for "${item}".\n[ESCROW] Escrow created for this trade.\n<@&${ADMIN_ROLE_ID}> Please review this transaction for safety.`;
      await sendLogToChannel(client, logMsg);
    } catch (err: any) {
      await message.reply(`Trade failed: ${err.message}`);
      // Log failure
      const logMsg = `[TRADE-FAILED] User ${message.author.tag} (${message.author.id}) tried to trade ${amount} coins to ${target ? target.tag : 'unknown'} (${target ? target.id : 'unknown'}) for "${item}".\nReason: ${err.message}\n<@&${ADMIN_ROLE_ID}>`;
      await sendLogToChannel(client, logMsg);
    }
  }
};

export default trade; 