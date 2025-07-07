import { EmbedBuilder, ColorResolvable, PermissionFlagsBits } from 'discord.js';
import { Command } from '../../types/command';
import { config } from '../../config';

const commandtray: Command = {
  options: {
    name: 'commandtray',
    description: 'List owner or admin commands',
    category: 'system',
    usage: 'commandtray',
    ownerOnly: true
  },

  execute: async ({ client, message }) => {
    if (!message) return;

    const commands = Array.from(client.commands.values()).filter(cmd =>
      cmd.options.ownerOnly || (cmd.options.permissions && cmd.options.permissions.includes(PermissionFlagsBits.Administrator))
    );

    const embed = new EmbedBuilder()
      .setColor(config.embedColor as ColorResolvable)
      .setTitle('Command Tray')
      .setDescription(commands.map(c => `**${c.options.name}** - ${c.options.description}`).join('\n') || 'No commands');

    await message.reply({ embeds: [embed] });
  }
};

export default commandtray;
