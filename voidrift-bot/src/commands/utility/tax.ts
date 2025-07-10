import { Command, CommandExecuteOptions } from '../../types/command';
import { subtractBalance } from '../../utils/economyStore';
import { PermissionChecker } from '../../utils/permcheck';
import { config } from '../../config';
import { Logger } from '../../utils/logger';
// High-risk command: Tax (remove) VCoins from any user. Only owner/admin can use. INFINITE_MONEY_USER_ID is protected.
// DMs are rate-limited to prevent abuse. All actions are logged.
// DM rate-limiting: Only 1 DM per user per minute
const lastDmTimestamps: Record<string, number> = {};

const tax: Command = {
  options: {
    name: 'tax',
    description: 'Admin only: Remove VCoins from any user.',
    category: 'utility',
    usage: '/tax <@user> <amount>',
    permissions: ['Administrator']
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message || !message.member) {
      await message?.reply('Only admins can use this command.');
      return;
    }
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
      if (!args || args.length < 2 || message.mentions.users.size === 0) {
        await message.reply('Usage: !tax <@user> <amount>');
        return;
      }
      const user = message.mentions.users.first()!;
      const amount = parseInt(args[1], 10);
      if (isNaN(amount) || amount < 1) {
        await message.reply('Please provide a valid amount.');
        return;
      }
      // Prevent taxing INFINITE_MONEY_USER_ID unless you/Champion
      const INFINITE_MONEY_USER_ID = process.env.INFINITE_MONEY_USER_ID;
      if (user.id === INFINITE_MONEY_USER_ID && !isOwner) {
        await message.reply('You cannot tax the infinite money user.');
        return;
      }
      subtractBalance(user.id, amount);
      await message.reply(`Taxed 🪙 ${amount} VCoins from ${user.tag}.`);
      try {
        const now = Date.now();
        if (!lastDmTimestamps[user.id] || now - lastDmTimestamps[user.id] > 60 * 1000) {
          await user.send(`An admin has taxed 🪙 ${amount} VCoins from your balance.`);
          lastDmTimestamps[user.id] = now;
        }
      } catch {}
      Logger.info(`Admin ${message.author.tag} (${message.author.id}) taxed ${amount} VCoins from ${user.tag} (${user.id})`);
    } catch (err) {
      Logger.error(`Failed in !tax: ${err}`);
      await message.reply('Sorry, something went wrong!');
    }
  }
};

export default tax; 