import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder } from 'discord.js';
import { config } from '../../config';

/**
 * Servericon command - displays the server's icon
 * Useful for cybersecurity/IT communities to showcase server branding
 */
const servericon: Command = {
  options: {
    name: 'servericon',
    description: 'Display the server\'s icon with detailed information.',
    category: 'utility',
    usage: '/servericon',
    examples: ['/servericon']
  },
  execute: async ({ message }: CommandExecuteOptions) => {
    if (!message || !message.guild) {
      await message?.reply('❌ This command can only be used in a server!');
      return;
    }

    const guild = message.guild;
    
    if (!guild.icon) {
      const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('🚫 No Server Icon')
        .setDescription(`${guild.name} doesn't have an icon set.`)
        .setFooter({ text: `Requested by ${message.author.tag}` })
        .setTimestamp();
      
      await message.reply({ embeds: [embed] });
      return;
    }

    // Create server icon embed
    const defaultColor = (config.embedColor as string) || '#2d0036';
    const embed = new EmbedBuilder()
      .setColor(defaultColor as any)
      .setTitle(`🏛️ Server Icon for ${guild.name}`)
      .setDescription(`**Server:** ${guild.name}\n**Server ID:** \`${guild.id}\``)
      .setImage(guild.iconURL({ size: 1024 }))
      .addFields(
        { 
          name: '📊 Icon Information', 
          value: `**Format:** PNG/JPG\n**Size:** 1024px (High Quality)\n**Direct Link:** [Click Here](${guild.iconURL({ size: 1024 })})`, 
          inline: false 
        },
        { 
          name: '🔗 Quick Links', 
          value: `[Icon](${guild.iconURL({ size: 1024 })}) • [Icon 256px](${guild.iconURL({ size: 256 })}) • [Icon 128px](${guild.iconURL({ size: 128 })})`, 
          inline: false 
        },
        { 
          name: '📈 Server Stats', 
          value: `**Members:** ${guild.memberCount}\n**Created:** <t:${Math.floor(guild.createdTimestamp / 1000)}:F>\n**Owner:** <@${guild.ownerId}>`, 
          inline: false 
        }
      )
      .setFooter({ 
        text: `Requested by ${message.author.tag} • Cybersecurity Server Info` 
      })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};

export default servericon; 