
import { EmbedBuilder, User,ColorResolvable  } from 'discord.js';
import { Command } from '../../types/command';
import { config } from '../../config';

const avatar: Command = 
{
  options: 
  {
    name: 'avatar',
    description: 'Display a user\'s avatar',
    category: 'utility',
    aliases: ['av', 'pfp'],
    usage: 'avatar [@user]',
    examples: ['avatar', 'avatar @john']
  },
  
  execute: async ({ client, message, args }) => 
  {
    if (!message) return;

    let targetUser: User;
    
    if (args && args.length > 0) {
      const userMention = args[0];
      const userId = userMention.replace(/[<@!>]/g, '');
      
      try 
      {
        targetUser = await client.users.fetch(userId);
      } catch 
      {
        await message.reply('❌ User not found!');
        return;
      }
    } else 
    {
      targetUser = message.author;
    }

    const embed = new EmbedBuilder()
      .setColor(config.embedColor as ColorResolvable)
      .setTitle(`${targetUser.tag}'s Avatar`)
      .setImage(targetUser.displayAvatarURL({ size: 1024 }))
      .setDescription(`[Download Link](${targetUser.displayAvatarURL({ size: 1024 })})`)
      .setTimestamp()
      .setFooter({ text: `Requested by ${message.author.tag}` });

    await message.reply({ embeds: [embed] });
  }
};

export default avatar;