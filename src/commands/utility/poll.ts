import { EmbedBuilder, ColorResolvable } from 'discord.js';
import { Command, CommandExecuteOptions } from '../../types/command';
import { config } from '../../config';

const poll: Command = {
  options: {
    name: 'poll',
    description: 'Create a poll with reactions',
    category: 'fun',
    aliases: ['vote'],
    usage: 'poll <question> | <option1> | <option2> | [option3] | [option4]',
    examples: ["poll What's your favorite color? | Red | Blue | Green"],
    guildOnly: true
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message) return;
    if (!args || args.length === 0) {
      await message.reply('❌ Please provide a question and options! Usage: `poll <question> | <option1> | <option2>`');
      return;
    }
    const pollData = args.join(' ').split('|').map(s => s.trim());
    if (pollData.length < 3) {
      await message.reply('❌ Please provide at least a question and 2 options!');
      return;
    }
    if (pollData.length > 5) {
      await message.reply('❌ Maximum 4 options allowed!');
      return;
    }
    const question = pollData[0];
    const options = pollData.slice(1);
    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];
    const pollOptions = options.map((option: string, i: number) => `${emojis[i]} ${option}`).join('\n');
    const defaultColor = (config.embedColor as string) || '#2d0036';
    const embed = new EmbedBuilder()
      .setColor(defaultColor as any)
      .setTitle('📊 Poll')
      .setDescription(`**${question}**\n\n${pollOptions}`)
      .setTimestamp()
      .setFooter({ text: `Poll created by ${message.author.tag}` });
    // Send the poll message
    const pollMessage = await message.reply({ embeds: [embed] });
    // Add reactions
    options.forEach((option: string, i: number) => {
      pollMessage.react(emojis[i]);
    });
  }
};
export default poll; 