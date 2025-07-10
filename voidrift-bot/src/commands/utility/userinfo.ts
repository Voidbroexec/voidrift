import { EmbedBuilder, User,ColorResolvable  } from 'discord.js';
import { Command, CommandExecuteOptions } from '../../types/command';
import { config } from '../../config';

const userinfo: Command = 
{
  options: 
  {
    name: 'userinfo',
    description: 'Get information about a user',
    category: 'utility',
    usage: '/userinfo [@user]',
    guildOnly: true
  },
  
  execute: async ({ message, client, args }: CommandExecuteOptions) => 
  {
    if (!message?.guild) return;

    let targetUser: User;

    if (args && args.length > 0) 
    {
      // Try to get user from mention or ID
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

    const member = await message.guild.members.fetch(targetUser.id).catch(() => null);
    
    const defaultColor = (config.embedColor as string) || '#2d0036';
    const embed = new EmbedBuilder()
      .setColor(defaultColor as any)
      .setTitle(`${targetUser.tag}`)
      .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: '👤 Username', value: targetUser.username, inline: true },
        { name: '🆔 User ID', value: targetUser.id, inline: true },
        { name: '📅 Account Created', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>`, inline: false }
      );

    if (member) 
    {
      embed.addFields(
        { name: '📊 Server Join Date', value: `<t:${Math.floor(member.joinedTimestamp! / 1000)}:F>`, inline: false },
        { name: '🏆 Highest Role', value: member.roles.highest.name, inline: true },
        { name: '🎭 Roles', value: `${member.roles.cache.size - 1}`, inline: true }
      );

      if (member.premiumSince) 
      {
        embed.addFields({ name: '💎 Boosting Since', value: `<t:${Math.floor(member.premiumSince.getTime() / 1000)}:F>`, inline: false });
      }
    }

    embed.setTimestamp()
      .setFooter({ text: `Requested by ${message.author.tag}` });

    await message.reply({ embeds: [embed] });
  }
};

export default userinfo;