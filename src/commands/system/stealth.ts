import { EmbedBuilder, ColorResolvable } from 'discord.js';
import { Command } from '../../types/command';
import { config } from '../../config';
import { setStealth, automationConfig } from '../../utils/automationConfig';

const stealth: Command = {
  options: {
    name: 'stealth',
    description: 'Toggle stealth mode to suppress automations',
    category: 'system',
    usage: 'stealth <on|off>',
    ownerOnly: true
  },

  execute: async ({ message, args }) => {
    if (!message || !args || args.length === 0) return;

    const mode = args[0].toLowerCase();
    if (mode !== 'on' && mode !== 'off') return;

    setStealth(mode === 'on');
    const embed = new EmbedBuilder()
      .setColor(config.embedColor as ColorResolvable)
      .setTitle('Stealth Mode')
      .setDescription(`Stealth mode is now **${mode === 'on' ? 'ON' : 'OFF'}**`);

    await message.reply({ embeds: [embed] });
  }
};

export default stealth;
