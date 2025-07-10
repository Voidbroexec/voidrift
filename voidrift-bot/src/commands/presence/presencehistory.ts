import { EmbedBuilder, ColorResolvable } from 'discord.js';
import { Command } from '../../types/command';
import { config } from '../../config';
import { getPresenceHistory } from '../../utils/presenceHistory';

const presencehistory: Command = {
  options: {
    name: 'presencehistory',
    description: 'Show recent bot status changes',
    category: 'presence',
    usage: 'presencehistory',
    ownerOnly: true
  },

  execute: async ({ message }) => {
    if (!message) return;

    const history = getPresenceHistory().slice(-10).reverse();
    const lines = history.map(h => `${new Date(h.timestamp).toLocaleString()} - ${h.status}`);

    const color = /^#?[0-9A-Fa-f]{6}$/.test(config.embedColor) ? config.embedColor : '#7289da';
    const embed = new EmbedBuilder()
      .setColor(color as ColorResolvable)
      .setTitle('Presence History')
      .setDescription(lines.join('\n') || 'No history recorded.');

    await message.reply({ embeds: [embed] });
  }
};

export default presencehistory;
