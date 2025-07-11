import { Command, CommandExecuteOptions } from '../../types/command';
import { moveToEscrow } from '../../db/database';
import { sendLogToChannel } from '../../utils/logger';
import { TextChannel } from 'discord.js';

const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID || 'ADMIN_ROLE_ID'; // Set your admin role ID in .env
const GIVEAWAY_EMOJI = '🎉';

const giveaways: Record<string, { prize: string; entries: Set<string>; amount: number; endTime: number }> = {};

const giveaway: Command = {
  options: {
    name: 'giveaway',
    description: 'Start a giveaway.',
    usage: '/giveaway <duration> <amount> <prize>',
    category: 'utility',
    permissions: ['ManageMessages'],
    guildOnly: true
  },
  execute: async ({ client, message, args }: CommandExecuteOptions) => {
    if (!message || !message.guild || !message.member) return;
    if (!message.member.permissions.has('ManageMessages')) {
      await message.reply('You need the Manage Messages permission to start a giveaway.');
      return;
    }
    if (!args || args.length < 3) {
      await message.reply('Usage: /giveaway <duration in minutes> <amount> <prize>');
      return;
    }
    const duration = parseInt(args[0], 10);
    const amount = parseInt(args[1], 10);
    const prize = args.slice(2).join(' ');
    if (isNaN(duration) || duration < 1 || duration > 1440 || isNaN(amount) || amount <= 0 || !prize) {
      await message.reply('Please provide a valid duration (1-1440), amount (>0), and prize.');
      return;
    }
    const channel = message.channel as TextChannel;
    const endTime = Date.now() + duration * 60 * 1000;
    const giveawayMsg = await channel.send(
      `🎉 **GIVEAWAY** 🎉\nPrize: **${prize}**\nEntry: ${amount} coins\nReact with ${GIVEAWAY_EMOJI} to enter!\nEnds <t:${Math.floor(endTime/1000)}:R>`
    );
    await giveawayMsg.react(GIVEAWAY_EMOJI);
    giveaways[giveawayMsg.id] = { prize, entries: new Set(), amount, endTime };
    // Collect entries
    const collector = giveawayMsg.createReactionCollector({
      filter: (reaction, user) => reaction.emoji.name === GIVEAWAY_EMOJI && !user.bot,
      time: duration * 60 * 1000
    });
    collector.on('collect', async (reaction, user) => {
      try {
        moveToEscrow(user.id, amount, `Giveaway entry: ${prize}`);
        giveaways[giveawayMsg.id].entries.add(user.id);
        const logMsg = `[GIVEAWAY-ENTRY] User ${user.tag} (${user.id}) entered giveaway ${giveawayMsg.id} for ${amount} coins.\n[ESCROW] Escrow created for this entry.\n<@&${ADMIN_ROLE_ID}>`;
        await sendLogToChannel(client, logMsg);
      } catch (err: any) {
        const logMsg = `[GIVEAWAY-ENTRY-FAILED] User ${user.tag} (${user.id}) failed to enter giveaway ${giveawayMsg.id}.\nReason: ${err.message}\n<@&${ADMIN_ROLE_ID}>`;
        await sendLogToChannel(client, logMsg);
      }
    });
    collector.on('end', async () => {
      const entryIds = Array.from(giveaways[giveawayMsg.id].entries);
      if (entryIds.length === 0) {
        await channel.send('No valid entries, no winner this time.');
        return;
      }
      const winnerId = entryIds[Math.floor(Math.random() * entryIds.length)];
      await channel.send(`🎉 Congratulations <@${winnerId}>! You won the **${prize}**!`);
      const logMsg = `[GIVEAWAY-END] Winner: <@${winnerId}> (${winnerId}) for prize: ${prize}.\n<@&${ADMIN_ROLE_ID}>`;
      await sendLogToChannel(client, logMsg);
      delete giveaways[giveawayMsg.id];
    });
    await message.reply('Giveaway started!');
  }
};

export default giveaway; 