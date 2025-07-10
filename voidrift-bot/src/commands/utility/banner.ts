import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder, User } from 'discord.js';
import { config } from '../../config';

/**
 * Banner command - displays a user's banner image
 * Perfect for cybersecurity/IT communities to showcase user profiles
 */
const banner: Command = {
  options: {
    name: 'banner',
    description: 'Display a user\'s banner image with detailed information.',
    category: 'utility',
    usage: '/banner [@user]',
    examples: ['/banner', '/banner @someone']
  },
  execute: async ({ message, args, client }: CommandExecuteOptions) => {
    if (!message) return;
    
    let target: User | null = null;
    
    // Parse user argument
    if (args && args.length > 0) {
      const userMention = args[0];
      const userId = userMention.replace(/[<@!>]/g, '');
      try {
        target = await client.users.fetch(userId);
      } catch {
        await message.reply('❌ User not found!');
        return;
      }
    } else {
      target = message.author;
    }
    
    if (!target) {
      await message.reply('❌ User not found!');
      return;
    }

    // Fetch user with banner
    try {
      const user = await client.users.fetch(target.id, { force: true });
      
      if (!user.banner) {
        const embed = new EmbedBuilder()
          .setColor('#ff6b6b')
          .setTitle('🚫 No Banner Found')
          .setDescription(`${user.tag} doesn't have a banner set.`)
          .setThumbnail(user.displayAvatarURL({ size: 256 }))
          .setFooter({ text: `Requested by ${message.author.tag}` })
          .setTimestamp();
        
        await message.reply({ embeds: [embed] });
        return;
      }

      // Create banner embed
      const defaultColor = (config.embedColor as string) || '#2d0036';
      const embed = new EmbedBuilder()
        .setColor(defaultColor as any)
        .setTitle(`🖼️ Banner for ${user.tag}`)
        .setDescription(`**User:** ${user.toString()}\n**User ID:** \`${user.id}\``)
        .setImage(user.bannerURL({ size: 1024 }))
        .setThumbnail(user.displayAvatarURL({ size: 256 }))
        .addFields(
          { 
            name: '📊 Banner Information', 
            value: `**Format:** PNG/JPG\n**Size:** 1024px (High Quality)\n**Direct Link:** [Click Here](${user.bannerURL({ size: 1024 })})`, 
            inline: false 
          },
          { 
            name: '🔗 Quick Links', 
            value: `[Avatar](${user.displayAvatarURL({ size: 1024 })}) • [Banner](${user.bannerURL({ size: 1024 })})`, 
            inline: false 
          }
        )
        .setFooter({ 
          text: `Requested by ${message.author.tag} • Cybersecurity Profile Viewer` 
        })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error fetching user banner:', error);
      await message.reply('❌ Failed to fetch user banner. The user might not exist or have a banner.');
    }
  }
};

export default banner; 