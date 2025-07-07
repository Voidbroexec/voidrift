import { EmbedBuilder, ColorResolvable } from 'discord.js';
import { Command } from '../../types/command';
import { config } from '../../config';
import { getSnipes } from '../../utils/snipeStore';

const snipe: Command = {
  options: {
    name: 'snipe',
    description: 'Retrieve the last deleted message in this channel',
    category: 'utility',
    usage: 'snipe',
    ownerOnly: true
  },

  execute: async ({ message }) => {
    if (!message) return;

    const snipes = getSnipes(message.channelId);
    const last = snipes[snipes.length - 1];
    if (!last) {
      await message.reply('Nothing to snipe.');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(config.embedColor as ColorResolvable)
      .setTitle('Sniped Message')
      .setDescription(last.content)
      .setFooter({ text: `Deleted by ${last.author}` })
      .setTimestamp(last.timestamp);

    await message.reply({ embeds: [embed] });
  }
};

export default snipe;
