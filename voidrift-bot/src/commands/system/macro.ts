import { EmbedBuilder, ColorResolvable } from 'discord.js';
import { Command } from '../../types/command';
import { config } from '../../config';
import { addMacro, removeMacro, listMacros } from '../../utils/automationConfig';

const macro: Command = {
  options: {
    name: 'macro',
    description: 'Create or manage quick macros',
    category: 'system',
    usage: 'macro <add|remove|list> [name] [text]',
    ownerOnly: true
  },

  execute: async ({ message, args }) => {
    if (!message || !args || args.length === 0) return;

    const sub = args[0].toLowerCase();
    if (sub === 'add' && args.length >= 3) {
      const name = args[1].toLowerCase();
      const text = args.slice(2).join(' ');
      addMacro(name, text);
      const embed = new EmbedBuilder()
        .setColor(config.embedColor as ColorResolvable)
        .setTitle('Macro Added')
        .setDescription(`\`${name}\` -> ${text}`);
      await message.reply({ embeds: [embed] });
    } else if (sub === 'remove' && args.length >= 2) {
      const name = args[1].toLowerCase();
      removeMacro(name);
      const embed = new EmbedBuilder()
        .setColor(config.embedColor as ColorResolvable)
        .setTitle('Macro Removed')
        .setDescription(`\`${name}\` removed`);
      await message.reply({ embeds: [embed] });
    } else if (sub === 'list') {
      const macros = listMacros();
      const names = Object.keys(macros);
      const embed = new EmbedBuilder()
        .setColor(config.embedColor as ColorResolvable)
        .setTitle('Macros')
        .setDescription(names.length ? names.map(n => `\`${n}\``).join(', ') : 'No macros set.');
      await message.reply({ embeds: [embed] });
    } else {
      await message.reply('Invalid macro command.');
    }
  }
};

export default macro;
