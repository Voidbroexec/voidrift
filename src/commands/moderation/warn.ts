import { Command } from '../../types/command';
import { PermissionChecker } from '../../utils/permcheck';
import { sendLogToChannel } from '../../utils/logger';
import { db } from '../../db/database';
// DM rate-limiting: Only 1 DM per user per minute
const lastDmTimestamps: Record<string, number> = {};

const warn: Command = {
  options: {
    name: 'warn',
    description: 'Warn a user and log the reason.',
    category: 'moderation',
    usage: '!warn <@user> <reason>'
  },
  execute: async ({ message, args }) => {
    if (!message || !message.member) return;
    if (!PermissionChecker.isAdmin(message.author.id, message.member) && !message.member.permissions.has('KickMembers')) {
      await message.reply('You need the Kick Members permission or be a bot admin to use this command.');
      return;
    }
    const user = message.mentions.members?.first();
    const reason = args?.slice(1).join(' ') || 'No reason provided';
    if (!user) {
      await message.reply('Please mention a user to warn.');
      return;
    }
    await message.reply(`${user} has been warned. Reason: ${reason}`);
    // Log to channel
    const logMsg = `[WARN] ${user.user.tag} (${user.id}) was warned by ${message.author.tag} (${message.author.id}). Reason: ${reason}`;
    await sendLogToChannel(message.client, logMsg);
    // Log to SQLite (reuse bans table for warnings, or create a warnings table if needed)
    db.prepare('INSERT INTO bans (user_id, reason, moderator, banned_at) VALUES (?, ?, ?, ?)')
      .run(user.id, `[WARN] ${reason}`, message.author.id, Date.now());
    // DM the warned user (rate-limited)
    try {
      const now = Date.now();
      if (!lastDmTimestamps[user.id] || now - lastDmTimestamps[user.id] > 60 * 1000) {
        await user.send(`You have been warned in ${message.guild?.name ?? 'the server'}. Reason: ${reason}`);
        lastDmTimestamps[user.id] = now;
      }
    } catch {}
  }
};

export default warn; 