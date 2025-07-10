import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder } from 'discord.js';
import { config } from '../../config';

const choices = ['rock', 'paper', 'scissors'];

const rps: Command = {
  options: {
    name: 'rps',
    description: 'Play Rock Paper Scissors with the bot.',
    category: 'fun',
    usage: 'rps <rock|paper|scissors>',
    examples: ['rps rock', 'rps paper', 'rps scissors']
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message) return;
    if (!args || args.length === 0) {
      await message.reply('Please choose rock, paper, or scissors!');
      return;
    }
    const userChoice = args[0].toLowerCase();
    if (!choices.includes(userChoice)) {
      await message.reply('Invalid choice! Use rock, paper, or scissors.');
      return;
    }
    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    let result = '';
    if (userChoice === botChoice) {
      result = "It's a tie!";
    } else if (
      (userChoice === 'rock' && botChoice === 'scissors') ||
      (userChoice === 'paper' && botChoice === 'rock') ||
      (userChoice === 'scissors' && botChoice === 'paper')
    ) {
      result = 'You win!';
    } else {
      result = 'You lose!';
    }
    const defaultColor = (config.embedColor as string) || '#2d0036';
    const embed = new EmbedBuilder()
      .setColor(defaultColor as any)
      .setTitle('✊🤚✌️ Rock Paper Scissors')
      .addFields(
        { name: 'Your Choice', value: userChoice, inline: true },
        { name: 'Bot Choice', value: botChoice, inline: true },
        { name: 'Result', value: result, inline: false }
      )
      .setFooter({ text: `Requested by ${message.author.tag}` });
    await message.reply({ embeds: [embed] });
  }
};
export default rps; 