import { EmbedBuilder, ColorResolvable } from 'discord.js';
import { Command } from '../../types/command';
import { config } from '../../config';
import { setDryReact } from '../../utils/automationConfig';

const setreact: Command = {
  options: {
    name: 'setreact',
    description: 'Configure emoji reaction for dry text',
    category: 'presence',
    usage: 'setreact <emoji> <word1> [word2] ...',
    ownerOnly: true
  },

  execute: async ({ message, args }) => {
    if (!message || !args || args.length < 2) return;

    const emoji = args[0];
    const triggers = args.slice(1).map(w => w.toLowerCase());
    setDryReact(emoji, triggers);

    const embed = new EmbedBuilder()
      .setColor(config.embedColor as ColorResolvable)
      .setTitle('Dry Text Reaction Updated')
      .setDescription(`Triggering on: ${triggers.join(', ')} with ${emoji}`);

    await message.reply({ embeds: [embed] });
  }
};

export default setreact;
