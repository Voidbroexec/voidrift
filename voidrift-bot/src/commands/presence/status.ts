import { EmbedBuilder, ActivityType,ColorResolvable  } from 'discord.js';
import { Command } from '../../types/command';
import { config } from '../../config';

const status: Command = 
{
  options: 
  {
    name: 'status',
    description: 'Change the bot\'s status and activity',
    category: 'presence',
    aliases: ['presence', 'activity'],
    usage: 'status <type> <text>',
    examples: ['status playing with commands', 'status listening to music', 'status watching YouTube'],
    ownerOnly: true
  },
  
  execute: async ({ client, message, args }) => 
    {
    if (!message || !args || args.length < 2) 
    {
      await message?.reply('❌ Please provide a status type and text!\nValid types: `playing`, `listening`, `watching`, `streaming`');
      return;
    }

    const typeArg = args[0].toLowerCase();
    const text = args.slice(1).join(' ');

    let activityType: ActivityType;
    
    switch (typeArg) 
    {
      case 'playing':
        activityType = ActivityType.Playing;
        break;
      case 'listening':
        activityType = ActivityType.Listening;
        break;
      case 'watching':
        activityType = ActivityType.Watching;
        break;
      case 'streaming':
        activityType = ActivityType.Streaming;
        break;
      default:
        await message.reply('❌ Invalid status type! Use: `playing`, `listening`, `watching`, or `streaming`');
        return;
    }

    try 
    {
      client.user?.setActivity(text, { type: activityType });
      
      const defaultColor = (config.embedColor as string) || '#2d0036';
      const embed = new EmbedBuilder()
        .setColor(defaultColor as any)
        .setTitle('✅ Status Updated')
        .setDescription(`Now ${typeArg} **${text}**`)
        .setTimestamp();

      await message.reply({ embeds: [embed] });
 
  }
  catch (error) 
  {
    console.error('Status update failed:', error); // Log error to your terminal
    await message.reply('❌ Failed to update status! Try again or contact support.');
  }
  }
};

export default status;