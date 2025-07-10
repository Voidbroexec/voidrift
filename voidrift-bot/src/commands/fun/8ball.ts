import { EmbedBuilder,ColorResolvable  } from 'discord.js';
import { Command, CommandExecuteOptions } from '../../types/command';
import { config } from '../../config';

const eightball: Command = 
{
  options: 
  {
    name: '8ball',
    description: 'Ask the magic 8-ball a question',
    category: 'fun',
    aliases: ['8b', 'eightball'],
    usage: '8ball <question>',
    examples: ['8ball Will it rain tomorrow?', '8ball Should I learn TypeScript?']
  },
  
  execute: async ({ message, args }: CommandExecuteOptions) => 
    {
    if (!message || !args || args.length === 0) 
    {
      await message?.reply('❌ Please ask a question!');
      return;
    }

    const responses = 
    [
      'It is certain.',
      'It is decidedly so.',
      'Without a doubt.',
      'Yes definitely.',
      'You may rely on it.',
      'As I see it, yes.',
      'Most likely.',
      'Outlook good.',
      'Yes.',
      'Signs point to yes.',
      'Reply hazy, try again.',
      'Ask again later.',
      'Better not tell you now.',
      'Cannot predict now.',
      'Concentrate and ask again.',
      'Don\'t count on it.',
      'My reply is no.',
      'My sources say no.',
      'Outlook not so good.',
      'Very doubtful.'
    ];

    const question = args.join(' ');
    const answer = responses[Math.floor(Math.random() * responses.length)];

    const defaultColor = (config.embedColor as string) || '#2d0036';
    const embed = new EmbedBuilder()
      .setColor(defaultColor as any)
      .setTitle('🎱 Magic 8-Ball')
      .addFields
      (
        { name: '❓ Question', value: question },
        { name: '🔮 Answer', value: answer }
      )
      .setTimestamp()
      .setFooter({ text: `Asked by ${message.author.tag}` });

    await message.reply({ embeds: [embed] });
  }
};

export default eightball;