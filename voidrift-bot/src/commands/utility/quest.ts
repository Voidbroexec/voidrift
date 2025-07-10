import { Command, CommandExecuteOptions } from '../../types/command';
import { config } from '../../config';
import { getBalance, subtractBalance, addBalance } from '../../utils/economyStore';
import { v4 as uuidv4 } from 'uuid';

// System quests (daily/weekly)
const QUESTS = [
  { id: 'messages', description: 'Send 5 messages today', reward: 100, type: 'daily' },
  { id: 'win_game', description: 'Win a game (e.g., slots, coinflip)', reward: 200, type: 'daily' }
];
let userQuestProgress: { [userId: string]: { [questId: string]: number } } = {};
let userQuestClaimed: { [userId: string]: { [questId: string]: boolean } } = {};

// User-created bounties
interface Bounty {
  id: string;
  creator: string;
  amount: number;
  info: string;
  claimedBy?: string;
  completed?: boolean;
}
let bounties: Bounty[] = [];

// DM rate-limiting: Only 1 DM per user per minute
const lastDmTimestamps: Record<string, number> = {};

const quest: Command = {
  options: {
    name: 'quest',
    description: 'View and claim quests, or create/claim/complete user bounties.',
    category: 'utility',
    usage: '/quest | /quest claim <questId> | /quest make <amount> <info> | /quest list | /quest complete <questId> <@solver>',
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message) return;
    const userId = message.author.id;
    // No args: show system quests
    if (!args || args.length === 0) {
      let reply = '**🗒️ Available System Quests:**\n';
      for (const q of QUESTS) {
        const progress = userQuestProgress[userId]?.[q.id] || 0;
        const claimed = userQuestClaimed[userId]?.[q.id];
        reply += `**${q.id}**: ${q.description} | Reward: 🪙 ${q.reward} VCoins | Progress: ${progress} | Claimed: ${claimed ? '✅' : '❌'}\n`;
      }
      reply += '\nUse `/quest claim <questId>` to claim a reward.';
      reply += '\nUse `/quest list` to view user-created bounties.';
      await message.reply(reply);
      return;
    }
    // User-created bounty: !quest make <amount> <info>
    if (args[0].toLowerCase() === 'make' && args.length >= 3) {
      const amount = parseInt(args[1], 10);
      const info = args.slice(2).join(' ');
      if (isNaN(amount) || amount < 1) {
        await message.reply('Please specify a valid VCoins amount.');
        return;
      }
      if (getBalance(userId) < amount) {
        await message.reply('You do not have enough VCoins to create this bounty.');
        return;
      }
      subtractBalance(userId, amount); // Escrow
      const bounty: Bounty = {
        id: uuidv4().slice(0, 8),
        creator: userId,
        amount,
        info
      };
      bounties.push(bounty);
      await message.reply(`Bounty created! ID: \`${bounty.id}\` | Reward: 🪙 ${amount} VCoins\nInfo: ${info}`);
      return;
    }
    // List bounties: !quest list
    if (args[0].toLowerCase() === 'list') {
      if (bounties.length === 0) {
        await message.reply('No user-created bounties available.');
        return;
      }
      let reply = '**💼 Open Bounties:**\n';
      for (const b of bounties.filter(b => !b.claimedBy && !b.completed)) {
        reply += `ID: \`${b.id}\` | Reward: 🪙 ${b.amount} VCoins | Info: ${b.info} | Creator: <@${b.creator}>\n`;
      }
      reply += '\nUse `/quest claim <questId>` to claim a bounty.';
      await message.reply(reply);
      return;
    }
    // Claim bounty: !quest claim <questId>
    if (args[0].toLowerCase() === 'claim' && args[1]) {
      // System quest claim
      const sysQuest = QUESTS.find(q => q.id === args[1]);
      if (sysQuest) {
        if (userQuestClaimed[userId]?.[sysQuest.id]) {
          await message.reply('You have already claimed this quest.');
          return;
        }
        if ((userQuestProgress[userId]?.[sysQuest.id] || 0) < 5) {
          await message.reply('You have not completed this quest yet.');
          return;
        }
        addBalance(userId, sysQuest.reward);
        userQuestClaimed[userId] = userQuestClaimed[userId] || {};
        userQuestClaimed[userId][sysQuest.id] = true;
        await message.reply(`Quest completed! You received 🪙 ${sysQuest.reward} VCoins.`);
        return;
      }
      // User bounty claim
      const bounty = bounties.find(b => b.id === args[1] && !b.claimedBy && !b.completed);
      if (!bounty) {
        await message.reply('Bounty not found or already claimed.');
        return;
      }
      if (bounty.creator === userId) {
        await message.reply('You cannot claim your own bounty.');
        return;
      }
      bounty.claimedBy = userId;
      await message.reply(`You have claimed bounty \`${bounty.id}\`. Please work with <@${bounty.creator}> to complete it!`);
      try {
        const now = Date.now();
        if (!lastDmTimestamps[bounty.creator] || now - lastDmTimestamps[bounty.creator] > 60 * 1000) {
          await message.client.users.fetch(bounty.creator).then(u => u.send(`<@${userId}> has claimed your bounty (ID: \`${bounty.id}\`).`));
          lastDmTimestamps[bounty.creator] = now;
        }
      } catch {}
      return;
    }
    // Complete bounty: !quest complete <questId> <@solver>
    if (args[0].toLowerCase() === 'complete' && args[1] && message.mentions.users.size > 0) {
      const bounty = bounties.find(b => b.id === args[1] && !b.completed);
      if (!bounty) {
        await message.reply('Bounty not found or already completed.');
        return;
      }
      if (bounty.creator !== userId) {
        await message.reply('Only the bounty creator can complete and pay out the bounty.');
        return;
      }
      const solver = message.mentions.users.first();
      if (!solver || bounty.claimedBy !== solver.id) {
        await message.reply('This user has not claimed the bounty.');
        return;
      }
      addBalance(solver.id, bounty.amount);
      bounty.completed = true;
      await message.reply(`Bounty completed! 🪙 ${bounty.amount} VCoins paid to ${solver.tag}.`);
      try {
        const now = Date.now();
        if (!lastDmTimestamps[solver.id] || now - lastDmTimestamps[solver.id] > 60 * 1000) {
          await solver.send(`You have received 🪙 ${bounty.amount} VCoins for completing bounty (ID: \`${bounty.id}\`).`);
          lastDmTimestamps[solver.id] = now;
        }
      } catch {}
      return;
    }
    await message.reply('Invalid quest command. Use `/quest`, `/quest make <amount> <info>`, `/quest list`, `/quest claim <questId>`, or `/quest complete <questId> <@solver>`.');
  }
};

export default quest; 