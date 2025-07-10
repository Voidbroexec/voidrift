import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder } from 'discord.js';
import { config } from '../../config';

const trollMessages = [
  'Skill issue.',
  'bruh.',
  'Imagine.',
  'L + Ratio.',
  'Get good.',
  'Not even close.',
  'Try again next time.',
  'Cope.',
  'You fell off.',
  'No shot.',
  'Yikes.',
  'This post was made by the winner gang.',
  "Couldn't be me.",
  'You just got trolled.',
  'Stay mad.'
];

const troll: Command = {
  options: {
    name: 'troll',
    description: 'Troll a mentioned user with a random message.',
    category: 'fun',
    usage: 'troll <@user>',
    examples: ['troll @someone']
  },
  execute: async ({ message }: CommandExecuteOptions) => {
    if (!message) return;
    const target = message.mentions.users.first();
    if (!target) {
      await message.reply('Usage: troll <@user>');
      return;
    }
    const trollMsg = trollMessages[Math.floor(Math.random() * trollMessages.length)];
    const defaultColor = (config.embedColor as string) || '#2d0036';
    const embed = new EmbedBuilder()
      .setColor(defaultColor as any)
      .setTitle('😈 Troll')
      .setDescription(`<@${target.id}> ${trollMsg}`)
      .setFooter({ text: `Trolled by ${message.author.tag}` });
    await message.reply({ embeds: [embed] });
  }
};
export default troll; 