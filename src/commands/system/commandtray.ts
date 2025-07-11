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

    const commands = (Array.from(client.commands.values()) as Command[]).filter(cmd =>
      cmd.options.ownerOnly || (cmd.options.permissions && cmd.options.permissions.includes(PermissionFlagsBits.Administrator))
    );

    const defaultColor = (config.embedColor as string) || '#2d0036';
    const embed = new EmbedBuilder()
      .setColor(defaultColor as any)
      .setTitle('Command Tray')
      .setDescription(commands.map((c: Command) => `**${c.options.name}** - ${c.options.description}`).join('\n') || 'No commands');

    await message.reply({ embeds: [embed] });
  }
};

export default commandtray;
