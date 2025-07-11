import { EmbedBuilder, ColorResolvable } from 'discord.js';
import { Command } from '../../types/command';
import { config } from '../../config';
import { setPresenceAction } from '../../utils/automationConfig';

const VALID_STATUSES = ['online', 'idle', 'dnd', 'invisible'];
const VALID_ACTIONS = ['message', 'activity'];

type Status = 'online' | 'idle' | 'dnd' | 'invisible';

const settrigger: Command = {
  options: {
    name: 'settrigger',
    description: 'Set action when bot status changes',
    category: 'presence',
    usage: 'settrigger <status> <message|activity> <text>',
    examples: ['settrigger idle message I\'m away', 'settrigger dnd activity Busy'],
    ownerOnly: true
  },

  execute: async ({ message, args }) => {
    if (!message || !args || args.length < 3) return;

    const status = args[0].toLowerCase();
    const action = args[1].toLowerCase();
    const text = args.slice(2).join(' ');

    if (!VALID_STATUSES.includes(status) || !VALID_ACTIONS.includes(action)) {
      await message.reply('❌ Invalid usage.');
      return;
    }

    if (action === 'message') {
      setPresenceAction(status as Status, { message: text });
    } else {
      setPresenceAction(status as Status, { activity: text });
    }

    const embed = new EmbedBuilder()
      .setColor(config.embedColor as ColorResolvable)
      .setTitle('Presence Trigger Updated')
      .setDescription(`When **${status}**, ${action} -> ${text}`);

    await message.reply({ embeds: [embed] });
  }
};

export default settrigger;
