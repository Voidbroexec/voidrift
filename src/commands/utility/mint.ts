import { Command, CommandExecuteOptions } from '../../types/command';
import { addBalance } from '../../utils/economyStore';
import { PermissionChecker } from '../../utils/permcheck';
import { config } from '../../config';
import { Logger } from '../../utils/logger';
// DM rate-limiting: Only 1 DM per user per minute
const lastDmTimestamps: Record<string, number> = {};

// High-risk command: Mint VCoins to any user. Only owner/admin can use. INFINITE_MONEY_USER_ID is protected.
// DMs are rate-limited to prevent abuse. All actions are logged.
const mint: Command = {
  options: {
    name: 'mint',
    description: 'Admin only: Give any user any amount of VCoins.',
    category: 'utility',
    usage: '/mint <@user> <amount>',
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
        await message.reply('Usage: /mint <@user> <amount>');
        return;
      }
      const user = message.mentions.users.first()!;
      const amount = parseInt(args[1], 10);
      if (isNaN(amount) || amount < 1) {
        await message.reply('Please provide a valid amount.');
        return;
      }
      // Prevent minting to INFINITE_MONEY_USER_ID unless you/Champion
      const INFINITE_MONEY_USER_ID = process.env.INFINITE_MONEY_USER_ID;
      if (user.id === INFINITE_MONEY_USER_ID && !isOwner) {
        await message.reply('You cannot mint to the infinite money user.');
        return;
      }
      addBalance(user.id, amount);
      await message.reply(`Minted 🪙 ${amount} VCoins for ${user.tag}.`);
      try {
        const now = Date.now();
        if (!lastDmTimestamps[user.id] || now - lastDmTimestamps[user.id] > 60 * 1000) {
          await user.send(`You received 🪙 ${amount} VCoins from an admin!`);
          lastDmTimestamps[user.id] = now;
        }
      } catch {}
      Logger.info(`Admin ${message.author.tag} (${message.author.id}) minted ${amount} VCoins for ${user.tag} (${user.id})`);
    } catch (err) {
      Logger.error(`Failed in !mint: ${err}`);
      await message.reply('Sorry, something went wrong!');
    }
  }
};

export default mint; 