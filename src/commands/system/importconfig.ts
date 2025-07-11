import { EmbedBuilder, ColorResolvable } from 'discord.js';
import { Command } from '../../types/command';
import { config } from '../../config';
import { importAutomationConfig } from '../../utils/automationConfig';

const importconfig: Command = {
  options: {
    name: 'importconfig',
    description: 'Import automation config from a file',
    category: 'system',
    usage: 'importconfig <path>',
    ownerOnly: true
  },

  execute: async ({ message, args }) => {
    if (!message || !args || args.length === 0) return;
    const path = args[0];
    const defaultColor = (config.embedColor as string) || '#2d0036';
    try {
      await importAutomationConfig(path);
      const embed = new EmbedBuilder()
        .setColor(defaultColor as any)
        .setTitle('Config Imported')
        .setDescription(`Loaded from **${path}**`);
      await message.reply({ embeds: [embed] });
    } catch (err) {
      await message.reply('Failed to import config.');
    }
  }
};

export default importconfig;
