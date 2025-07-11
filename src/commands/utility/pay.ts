import { Command, CommandExecuteOptions } from '../../types/command';
import { moveToEscrow } from '../../db/database';
import { sendLogToChannel } from '../../utils/logger';
import { config } from '../../config';
import { Logger } from '../../utils/logger';

// High-risk command: Pay (move to escrow) VCoins to another user. Only owner/admin can use. INFINITE_MONEY_USER_ID is protected.
// All actions are logged.
const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID || 'ADMIN_ROLE_ID'; // Set your admin role ID in .env

const pay: Command = {
  options: {
    name: 'pay',
    description: 'Send coins to another user.',
    usage: '/pay <@user> <amount>',
    category: 'utility',
  },
  execute: async ({ client, message, args }: CommandExecuteOptions) => {
    if (!message || !message.member) return;
    // Strict permission check: must be owner or admin (ID or role)
    const OWNER_ID = process.env.OWNER_ID || '';
    const isOwner = message.author.id === OWNER_ID;
    const isAdminId = config.adminIds.includes(message.author.id);
    const isAdminRole = config.adminRole && message.member.roles.cache.has(config.adminRole);
    if (!(isOwner || isAdminId || isAdminRole)) {
      await message.reply('Only the owner or an admin can use this command.');
      return;
    }
    try {
      if (!args || args.length < 2) {
        await message.reply('Usage: /pay <@user> <amount>');
        return;
      }
      const target = message.mentions.users.first();
      const amount = parseInt(args[1], 10);
      if (!target || isNaN(amount) || amount <= 0) {
        await message.reply('Please mention a valid user and amount.');
        return;
      }
      if (target.id === message.author.id) {
        await message.reply('You cannot pay yourself.');
        return;
      }
      // Prevent paying to INFINITE_MONEY_USER_ID unless you/Champion
      const INFINITE_MONEY_USER_ID = process.env.INFINITE_MONEY_USER_ID;
      if (target.id === INFINITE_MONEY_USER_ID && !isOwner) {
        await message.reply('You cannot pay to the infinite money user.');
        return;
      }
      // Escrow and safety check
      moveToEscrow(message.author.id, amount, `Pay to ${target.tag} (${target.id})`);
      await message.reply(`Your payment of ${amount} coins to ${target.tag} is now in escrow and pending admin review.`);
      // Log to channel and @mention admin role
      const logMsg = `[PAYMENT] User ${message.author.tag} (${message.author.id}) attempted to pay ${amount} coins to ${target.tag} (${target.id}).\n[ESCROW] Escrow created for this payment.`;
      await sendLogToChannel(client, logMsg);
      Logger.info(`User ${message.author.tag} (${message.author.id}) attempted to pay ${amount} coins to ${target.tag} (${target.id}).`);
    } catch (err: any) {
      await message.reply(`Payment failed: ${err.message}`);
      // Log failure
      const logMsg = `[PAYMENT-FAILED] User ${message.author.tag} (${message.author.id}) tried to pay ${args && args[1] ? args[1] : 'unknown'} coins to ${args && args[0] ? args[0] : 'unknown'} (unknown).\nReason: ${err.message}`;
      await sendLogToChannel(client, logMsg);
      Logger.error(`Failed in !pay: ${err}`);
    }
  }
};

export default pay; 