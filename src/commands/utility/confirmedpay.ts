import { Command, CommandExecuteOptions } from '../../types/command';
import { releaseEscrow, getUserEscrows } from '../../db/database';
import { sendLogToChannel } from '../../utils/logger';
import { config } from '../../config';
import { Logger } from '../../utils/logger';
// DM rate-limiting: Only 1 DM per user per minute
const lastDmTimestamps: Record<string, number> = {};

const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID || 'ADMIN_ROLE_ID'; // Set your admin role ID in .env

// High-risk command: Release escrowed payment to a user. Only owner/admin can use. INFINITE_MONEY_USER_ID is protected.
// DMs are rate-limited to prevent abuse. All actions are logged.
const confirmedpay: Command = {
  options: {
    name: 'confirmedpay',
    description: 'Admin: Confirm and release an escrowed payment.',
    usage: '/confirmedpay <@user> <job>',
    category: 'utility',
    ownerOnly: false,
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
    let target: any = undefined;
    let job: string = '';
    try {
      if (!args || args.length < 2) {
        await message.reply('Usage: /confirmedpay <@user> <job>');
        return;
      }
      target = message.mentions.users.first();
      job = args.slice(1).join(' ').trim();
      if (!target || !job) {
        await message.reply('Please mention a valid user and specify the job.');
        return;
      }
      // Prevent releasing escrow to INFINITE_MONEY_USER_ID unless you/Champion
      const INFINITE_MONEY_USER_ID = process.env.INFINITE_MONEY_USER_ID;
      if (target.id === INFINITE_MONEY_USER_ID && !isOwner) {
        await message.reply('You cannot release escrow to the infinite money user.');
        return;
      }
      // Find the most recent pending escrow for this user/job
      const escrows = getUserEscrows(target.id);
      const escrow = escrows.find(e => e.reason && e.reason.toLowerCase().includes(job.toLowerCase()));
      if (!escrow) {
        await message.reply('No matching pending escrow found for this user and job.');
        return;
      }
      releaseEscrow(escrow.id);
      await message.reply(`Escrow of ${escrow.amount} coins for ${target.tag} (${job}) has been released.`);
      try {
        const now = Date.now();
        if (!lastDmTimestamps[target.id] || now - lastDmTimestamps[target.id] > 60 * 1000) {
          await target.send(`Your escrowed payment of ${escrow.amount} coins for "${job}" has been released by an admin.`);
          lastDmTimestamps[target.id] = now;
        }
      } catch {}
      // Log to channel and @mention admin role
      const logMsg = `[CONFIRMEDPAY] Admin ${message.author.tag} (${message.author.id}) released escrow of ${escrow.amount} coins to ${target.tag} (${target.id}) for job: "${job}".`;
      await sendLogToChannel(client, logMsg);
      Logger.info(`Admin ${message.author.tag} (${message.author.id}) released escrow of ${escrow.amount} coins to ${target.tag} (${target.id}) for job: "${job}".`);
    } catch (err: any) {
      const safeTarget = target ? target : { tag: 'unknown', id: 'unknown' };
      const safeJob = job || '';
      await message.reply(`Failed to release escrow: ${err.message}`);
      const logMsg = `[CONFIRMEDPAY-FAILED] Admin ${message.author.tag} (${message.author.id}) tried to release escrow for ${safeTarget.tag} (${safeTarget.id}) for job: "${safeJob}".\nReason: ${err.message}`;
      await sendLogToChannel(client, logMsg);
      Logger.error(`Failed in !confirmedpay: ${err}`);
    }
  }
};

export default confirmedpay; 