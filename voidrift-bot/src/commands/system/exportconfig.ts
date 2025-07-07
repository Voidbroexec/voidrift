import { EmbedBuilder, ColorResolvable } from 'discord.js';
import { Command } from '../../types/command';
import { config } from '../../config';
import { exportAutomationConfig } from '../../utils/automationConfig';

const exportconfig: Command = {
  options: {
    name: 'exportconfig',
    description: 'Export automation config to a file',
    category: 'system',
    usage: 'exportconfig [path]',
    ownerOnly: true
  },

  execute: async ({ message, args }) => {
    if (!message) return;
    const path = args && args[0] ? args[0] : 'automation-config.json';
    try {
      await exportAutomationConfig(path);
      const embed = new EmbedBuilder()
        .setColor(config.embedColor as ColorResolvable)
        .setTitle('Config Exported')
        .setDescription(`Saved to **${path}**`);
      await message.reply({ embeds: [embed] });
    } catch (err) {
      await message.reply('Failed to export config.');
    }
  }
};

export default exportconfig;
