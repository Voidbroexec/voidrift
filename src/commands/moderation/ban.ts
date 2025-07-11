import { Command } from '../../types/command';
import { PermissionChecker } from '../../utils/permcheck';
import { sendLogToChannel } from '../../utils/logger';
import { db } from '../../db/database';
// DM rate-limiting: Only 1 DM per user per minute
const lastDmTimestamps: Record<string, number> = {};

const ban: Command = {
  options: {
    name: 'ban',
    description: 'Ban a user from the server.',
    category: 'moderation',
    usage: '!ban <@user> <reason>',
    permissions: ['BanMembers'],
    guildOnly: true
  },
  execute: async ({ message, args }) => {
    if (!message || !message.member || !message.guild) return;
    if (!PermissionChecker.isAdmin(message.author.id, message.member) && !message.member.permissions.has('BanMembers')) {
      await message.reply('You need the Ban Members permission or be a bot admin to use this command.');
      return;
    }
    const user = message.mentions.members?.first();
    const reason = args?.slice(1).join(' ') || 'No reason provided';
    if (!user) {
      await message.reply('Please mention a user to ban.');
      return;
    }
    if (!user.bannable) {
      await message.reply('I cannot ban this user.');
      return;
    }
    await user.ban({ reason });
    await message.reply(`${user} has been banned. Reason: ${reason}`);
    // Log to channel
    const logMsg = `[BAN] ${user.user.tag} (${user.id}) was banned by ${message.author.tag} (${message.author.id}). Reason: ${reason}`;
    await sendLogToChannel(message.client, logMsg);
    // Log to SQLite
    db.prepare('INSERT OR REPLACE INTO bans (user_id, reason, moderator, banned_at) VALUES (?, ?, ?, ?)')
      .run(user.id, reason, message.author.id, Date.now());
    // DM the banned user (rate-limited)
    try {
      const now = Date.now();
      if (!lastDmTimestamps[user.id] || now - lastDmTimestamps[user.id] > 60 * 1000) {
        await user.send(`You have been banned from ${message.guild.name}. Reason: ${reason}`);
        lastDmTimestamps[user.id] = now;
      }
    } catch {}
  }
};

export default ban; 