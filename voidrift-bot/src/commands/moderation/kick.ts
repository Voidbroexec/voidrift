import { Command } from '../../types/command';
import { PermissionChecker } from '../../utils/permcheck';
import { sendLogToChannel } from '../../utils/logger';
import { db } from '../../db/database';
// DM rate-limiting: Only 1 DM per user per minute
const lastDmTimestamps: Record<string, number> = {};

const kick: Command = {
  options: {
    name: 'kick',
    description: 'Kick a user from the server.',
    category: 'moderation',
    usage: '!kick <@user> <reason>',
    permissions: ['KickMembers'],
    guildOnly: true
  },
  execute: async ({ message, args }) => {
    if (!message || !message.member || !message.guild) return;
    if (!PermissionChecker.isAdmin(message.author.id, message.member) && !message.member.permissions.has('KickMembers')) {
      await message.reply('You need the Kick Members permission or be a bot admin to use this command.');
      return;
    }
    const user = message.mentions.members?.first();
    const reason = args?.slice(1).join(' ') || 'No reason provided';
    if (!user) {
      await message.reply('Please mention a user to kick.');
      return;
    }
    if (!user.kickable) {
      await message.reply('I cannot kick this user.');
      return;
    }
    await user.kick(reason);
    await message.reply(`${user} has been kicked. Reason: ${reason}`);
    // Log to channel
    const logMsg = `[KICK] ${user.user.tag} (${user.id}) was kicked by ${message.author.tag} (${message.author.id}). Reason: ${reason}`;
    await sendLogToChannel(message.client, logMsg);
    // Log to SQLite
    db.prepare('INSERT INTO bans (user_id, reason, moderator, banned_at) VALUES (?, ?, ?, ?)')
      .run(user.id, reason, message.author.id, Date.now());
    // DM the kicked user (rate-limited)
    try {
      const now = Date.now();
      if (!lastDmTimestamps[user.id] || now - lastDmTimestamps[user.id] > 60 * 1000) {
        await user.send(`You have been kicked from ${message.guild.name}. Reason: ${reason}`);
        lastDmTimestamps[user.id] = now;
      }
    } catch {}
  }
};

export default kick; 