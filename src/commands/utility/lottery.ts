import { Command, CommandExecuteOptions } from '../../types/command';
import { moveToEscrow } from '../../db/database';
import { sendLogToChannel } from '../../utils/logger';
import { PermissionFlagsBits } from 'discord.js';

const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID || 'ADMIN_ROLE_ID'; // Set your admin role ID in .env
const TICKET_PRICE = 100;

let tickets: { [userId: string]: number } = {};
let jackpot = 0;

const lottery: Command = {
  options: {
    name: 'lottery',
    description: 'Buy tickets for the VCoins lottery or draw a winner.',
    usage: '/lottery buy <tickets> | /lottery draw',
    category: 'utility',
  },
  execute: async ({ client, message, args }: CommandExecuteOptions) => {
    if (!message) return;
    if (!args || args.length === 0) {
      await message.reply(`Current jackpot: 🪙 ${jackpot} VCoins. Use \`!lottery buy <tickets>\` to participate.`);
      return;
    }
    if (args[0].toLowerCase() === 'buy') {
      const num = parseInt(args[1], 10);
      if (isNaN(num) || num < 1) {
        await message.reply('Please specify a valid number of tickets.');
        return;
      }
      const cost = num * TICKET_PRICE;
      try {
        moveToEscrow(message.author.id, cost, `Lottery ticket purchase: ${num} tickets`);
        tickets[message.author.id] = (tickets[message.author.id] || 0) + num;
        jackpot += cost;
        await message.reply(`You bought ${num} ticket(s) for 🪙 ${cost} VCoins! Current jackpot: 🪙 ${jackpot} VCoins.`);
        const logMsg = `[LOTTERY] User ${message.author.tag} (${message.author.id}) bought ${num} lottery tickets for ${cost} coins.\n[ESCROW] Escrow created for this lottery purchase.\n<@&${ADMIN_ROLE_ID}> Please review this transaction for safety.`;
        await sendLogToChannel(client, logMsg);
      } catch (err: any) {
        await message.reply(`Lottery ticket purchase failed: ${err.message}`);
        const logMsg = `[LOTTERY-FAILED] User ${message.author.tag} (${message.author.id}) tried to buy ${num} tickets for ${cost} coins.\nReason: ${err.message}\n<@&${ADMIN_ROLE_ID}>`;
        await sendLogToChannel(client, logMsg);
      }
      return;
    }
    if (args[0].toLowerCase() === 'draw') {
      // Only allow admins to draw
      if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
        await message.reply('Only admins can draw the lottery.');
        return;
      }
      const allTickets = Object.entries(tickets).flatMap(([userId, count]) => Array(count).fill(userId));
      if (allTickets.length === 0) {
        await message.reply('No tickets have been purchased.');
        return;
      }
      const winnerId = allTickets[Math.floor(Math.random() * allTickets.length)];
      await message.reply(`🎉 <@${winnerId}> has won the lottery and receives 🪙 ${jackpot} VCoins!`);
      const logMsg = `[LOTTERY-END] Winner: <@${winnerId}> (${winnerId}) for jackpot: ${jackpot}.\n<@&${ADMIN_ROLE_ID}>`;
      await sendLogToChannel(client, logMsg);
      // Reset
      tickets = {};
      jackpot = 0;
      return;
    }
    await message.reply('Invalid lottery command. Use `!lottery buy <tickets>` or `!lottery draw`.');
  }
};

export default lottery;