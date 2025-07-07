import { EmbedBuilder, ColorResolvable } from 'discord.js';
import { Command } from '../../types/command';
import { config } from '../../config';
import { setUserTrigger } from '../../utils/automationConfig';

const setusertrigger: Command = {
  options: {
    name: 'setusertrigger',
    description: 'Set automation for a specific user',
    category: 'presence',
    usage: 'setusertrigger <@user> <reply|- > <emoji|->',
    ownerOnly: true
  },

  execute: async ({ message, args }) => {
    if (!message || !args || args.length < 3) return;

    const user = message.mentions.users.first();
    if (!user) return;

    const reply = args[1] === '-' ? undefined : args[1];
    const emoji = args[2] === '-' ? undefined : args[2];

    setUserTrigger(user.id, { autoReply: reply, reactEmoji: emoji });

    const embed = new EmbedBuilder()
      .setColor(config.embedColor as ColorResolvable)
      .setTitle('User Trigger Updated')
      .setDescription(`Triggers set for ${user.tag}`);

    await message.reply({ embeds: [embed] });
  }
};

export default setusertrigger;
