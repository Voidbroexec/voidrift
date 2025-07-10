import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder } from 'discord.js';
import { config } from '../../config';

/**
 * Emojilist command - displays all custom emojis in the server
 * Useful for cybersecurity/IT communities to manage server emojis
 */
const emojilist: Command = {
  options: {
    name: 'emojilist',
    description: 'Display all custom emojis in the server with their details.',
    category: 'utility',
    usage: '/emojilist',
    examples: ['/emojilist']
  },
  execute: async ({ message }: CommandExecuteOptions) => {
    if (!message || !message.guild) {
      await message?.reply('❌ This command can only be used in a server!');
      return;
    }

    const guild = message.guild;
    const emojis = guild.emojis.cache;

    if (emojis.size === 0) {
      const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('🚫 No Custom Emojis')
        .setDescription(`${guild.name} doesn't have any custom emojis.`)
        .setFooter({ text: `Requested by ${message.author.tag}` })
        .setTimestamp();
      
      await message.reply({ embeds: [embed] });
      return;
    }

    // Create emoji list embed
    const defaultColor = (config.embedColor as string) || '#2d0036';
    const embed = new EmbedBuilder()
      .setColor(defaultColor as any)
      .setTitle(`😄 Custom Emojis in ${guild.name}`)
      .setDescription(`**Total Emojis:** ${emojis.size}`)
      .setFooter({ 
        text: `Requested by ${message.author.tag} • Cybersecurity Emoji Manager` 
      })
      .setTimestamp();

    // Group emojis by animated/static
    const animatedEmojis = emojis.filter(emoji => emoji.animated);
    const staticEmojis = emojis.filter(emoji => !emoji.animated);

    // Add animated emojis field
    if (animatedEmojis.size > 0) {
      const animatedList = animatedEmojis
        .map(emoji => `${emoji} \`${emoji.name}\``)
        .join('\n');
      
      embed.addFields({
        name: `🎬 Animated Emojis (${animatedEmojis.size})`,
        value: animatedList.length > 1024 ? animatedList.substring(0, 1021) + '...' : animatedList,
        inline: false
      });
    }

    // Add static emojis field
    if (staticEmojis.size > 0) {
      const staticList = staticEmojis
        .map(emoji => `${emoji} \`${emoji.name}\``)
        .join('\n');
      
      embed.addFields({
        name: `🖼️ Static Emojis (${staticEmojis.size})`,
        value: staticList.length > 1024 ? staticList.substring(0, 1021) + '...' : staticList,
        inline: false
      });
    }

    // Add emoji statistics
    const totalSize = emojis.size;
    const animatedCount = animatedEmojis.size;
    const staticCount = staticEmojis.size;
    
    embed.addFields({
      name: '📊 Emoji Statistics',
      value: `**Total:** ${totalSize}\n**Animated:** ${animatedCount}\n**Static:** ${staticCount}\n**Usage Format:** \`:emoji_name:\``,
      inline: false
    });

    await message.reply({ embeds: [embed] });
  }
};

export default emojilist; 