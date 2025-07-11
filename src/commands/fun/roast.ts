import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder } from 'discord.js';
import { config } from '../../config';

const roasts = [
  "I'd agree with you but then we'd both be wrong.",
  "If I wanted to kill myself, I'd climb your ego and jump to your IQ.",
  "You have the right to remain silent because whatever you say will probably be stupid anyway.",
  "I'm not insulting you, I'm describing you.",
  "You are the reason the gene pool needs a lifeguard.",
  "If laughter is the best medicine, your face must be curing the world.",
  "You're as useless as the 'ueue' in 'queue'.",
  "I thought of you today. It reminded me to take out the trash.",
  "You have the perfect face for radio.",
  "I'd explain it to you, but I don't have any crayons."
];

const roast: Command = {
  options: {
    name: 'roast',
    description: 'Playfully roast a mentioned user.',
    category: 'fun',
    usage: 'roast [@user]',
    examples: ['roast @someone', 'roast']
  },
  execute: async ({ message }: CommandExecuteOptions) => {
    if (!message) return;
    const target = message.mentions.users.first() || message.author;
    const roast = roasts[Math.floor(Math.random() * roasts.length)];
    const defaultColor = (config.embedColor as string) || '#2d0036';
    const embed = new EmbedBuilder()
      .setColor(defaultColor as any)
      .setTitle('🔥 Roast')
      .setDescription(`<@${target.id}> ${roast}`)
      .setFooter({ text: `Requested by ${message.author.tag}` });
    await message.reply({ embeds: [embed] });
  }
};
export default roast; 