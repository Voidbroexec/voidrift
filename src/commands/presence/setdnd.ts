import { EmbedBuilder, ColorResolvable } from 'discord.js';
import { Command } from '../../types/command';
import { config } from '../../config';
import { setDndMessage } from '../../utils/automationConfig';

const setdnd: Command = {
  options: {
    name: 'setdnd',
    description: 'Set auto-response message when bot is in DND status',
    category: 'presence',
    usage: 'setdnd <message>',
    ownerOnly: true
  },

  execute: async ({ message, args }) => {
    if (!message || !args || args.length === 0) return;

    const reply = args.join(' ');
    setDndMessage(reply);

    const embed = new EmbedBuilder()
      .setColor(config.embedColor as ColorResolvable)
      .setTitle('DND Auto-Responder Updated')
      .setDescription(`Now replying with: **${reply}**`);

    await message.reply({ embeds: [embed] });
  }
};

export default setdnd;
