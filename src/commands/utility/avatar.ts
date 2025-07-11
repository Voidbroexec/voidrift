import { EmbedBuilder, User,ColorResolvable  } from 'discord.js';
import { Command, CommandExecuteOptions } from '../../types/command';
import { config } from '../../config';

const avatar: Command = 
{
  options: 
  {
    name: 'avatar',
    description: 'Get a user\'s avatar in different sizes.',
    category: 'utility',
    aliases: ['av', 'pfp'],
    usage: 'avatar [@user]',
    examples: ['avatar', 'avatar @john']
  },
  
  execute: async ({ client, message, args }: CommandExecuteOptions) => 
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

    const color = /^#?[0-9A-Fa-f]{6}$/.test(config.embedColor) ? config.embedColor : '#7289da';
    const embed = new EmbedBuilder()
      .setColor(color as ColorResolvable)
      .setTitle(`${targetUser.tag}'s Avatar`)
      .setImage(targetUser.displayAvatarURL({ size: 1024 }))
      .setDescription(`[Download Link](${targetUser.displayAvatarURL({ size: 1024 })})`)
      .setTimestamp()
      .setFooter({ text: `Requested by ${message.author.tag}` });

    await message.reply({ embeds: [embed] });
  }
};

export default avatar;