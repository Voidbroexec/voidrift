import { Command, CommandExecuteOptions } from '../../types/command';
import { moveToEscrow } from '../../db/database';
import { sendLogToChannel } from '../../utils/logger';
import { config } from '../../config';
import { Logger } from '../../utils/logger';

const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID || 'ADMIN_ROLE_ID'; // Set your admin role ID in .env
const DAILY_REWARD = 200;
const DAILY_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours

const lastClaim: Record<string, number> = {};

// High-risk command: Daily reward (moves to escrow). Only owner/admin can use. INFINITE_MONEY_USER_ID is protected.
// All actions are logged.
const daily: Command = {
  options: {
    name: 'daily',
    description: 'Claim your daily reward.',
    usage: '/daily',
    category: 'utility',
  },
  execute: async ({ client, message }: CommandExecuteOptions) => {
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
      const now = Date.now();
      const last = lastClaim[message.author.id] || 0;
      if (now - last < DAILY_COOLDOWN) {
        const next = new Date(last + DAILY_COOLDOWN);
        await message.reply(`You already claimed your daily! Come back at <t:${Math.floor(next.getTime()/1000)}:R>.`);
        return;
      }
      // Prevent daily for INFINITE_MONEY_USER_ID unless you/Champion
      const INFINITE_MONEY_USER_ID = process.env.INFINITE_MONEY_USER_ID;
      if (message.author.id === INFINITE_MONEY_USER_ID && !isOwner) {
        await message.reply('You cannot claim daily as the infinite money user.');
        return;
      }
      // Escrow and safety check
      moveToEscrow(message.author.id, DAILY_REWARD, 'Daily reward');
      lastClaim[message.author.id] = now;
      await message.reply(`You claimed your daily reward of 🪙 ${DAILY_REWARD} VCoins! (Reward is escrowed, pending admin approval)`);
      // Log to channel and @mention admin role
      const logMsg = `[DAILY] User ${message.author.tag} (${message.author.id}) claimed their daily reward of ${DAILY_REWARD} coins.\n[ESCROW] Escrow created for this daily reward.`;
      await sendLogToChannel(client, logMsg);
      Logger.info(`User ${message.author.tag} (${message.author.id}) claimed their daily reward of ${DAILY_REWARD} coins.`);
    } catch (err: any) {
      await message.reply(`Daily reward claim failed: ${err.message}`);
      // Log failure
      const logMsg = `[DAILY-FAILED] User ${message.author.tag} (${message.author.id}) tried to claim daily reward.\nReason: ${err.message}`;
      await sendLogToChannel(client, logMsg);
      Logger.error(`Failed in !daily: ${err}`);
    }
  }
};

export default daily; 