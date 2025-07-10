import { EmbedBuilder, ChannelType, ColorResolvable, } from 'discord.js'; 
import { Command, CommandExecuteOptions } from '../../types/command';
import { config } from '../../config';

const serverinfo: Command = 
{
  options: 
  {
    name: 'serverinfo',
    description: 'Get information about the current server',
    category: 'utility',
    aliases: ['server', 'guild', 'si'],
    guildOnly: true
  },
  
  execute: async ({ message, client }: CommandExecuteOptions) => 
  {
    if (!message?.guild) return;

    const guild = message.guild;
    const owner = await guild.fetchOwner();
    
    const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
    const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;
    
    const defaultColor = (config.embedColor as string) || '#2d0036';
    const embed = new EmbedBuilder()
      .setColor(defaultColor as any)
      .setTitle(`📋 ${guild.name}`)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .addFields
      (
        { name: '👑 Owner', value: owner.user.tag, inline: true },
        { name: '🆔 Server ID', value: guild.id, inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
        { name: '👥 Members', value: guild.memberCount.toString(), inline: true },
        { name: '🔗 Channels', value: `${textChannels} Text, ${voiceChannels} Voice, ${categories} Categories`, inline: true },
        { name: '😀 Emojis', value: guild.emojis.cache.size.toString(), inline: true },
        { name: '🎭 Roles', value: guild.roles.cache.size.toString(), inline: true },
        { name: '💎 Boosts', value: `Level ${guild.premiumTier} (${guild.premiumSubscriptionCount} boosts)`, inline: true },
        { name: '🔒 Verification Level', value: guild.verificationLevel.toString(), inline: true }
      )
      .setTimestamp()
      .setFooter({ text: `Requested by ${message.author.tag}` });

    if (guild.description) 
    {
      embed.setDescription(guild.description);
    }

    if (guild.bannerURL()) 
    {
      embed.setImage(guild.bannerURL({ size: 1024 }));
    }

    await message.reply({ embeds: [embed] });
  }
};

export default serverinfo;