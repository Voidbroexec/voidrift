import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder } from 'discord.js';
import { config } from '../../config';

/**
 * Choose command - randomly select from options
 * Fun command for cybersecurity/IT communities to make decisions
 */
const choose: Command = {
  options: {
    name: 'choose',
    description: 'Randomly choose from a list of options.',
    category: 'fun',
    usage: '/choose [option1] [option2] [option3] ...',
    examples: ['/choose pizza burger sushi', '/choose red blue green yellow']
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message) return;

    if (!args || args.length < 2) {
      await message.reply('❌ Please provide at least 2 options! Usage: `/choose [option1] [option2] [option3] ...`');
      return;
    }

    // Parse options (split by spaces, but allow quoted strings)
    const options: string[] = [];
    let currentOption = '';
    let inQuotes = false;

    for (const arg of args) {
      if (arg.startsWith('"') && arg.endsWith('"')) {
        // Complete quoted option
        options.push(arg.slice(1, -1));
      } else if (arg.startsWith('"')) {
        // Start of quoted option
        inQuotes = true;
        currentOption = arg.slice(1);
      } else if (arg.endsWith('"')) {
        // End of quoted option
        inQuotes = false;
        currentOption += ' ' + arg.slice(0, -1);
        options.push(currentOption);
        currentOption = '';
      } else if (inQuotes) {
        // Middle of quoted option
        currentOption += ' ' + arg;
      } else {
        // Regular option
        options.push(arg);
      }
    }

    // Add any remaining option
    if (currentOption) {
      options.push(currentOption);
    }

    // Validate options
    if (options.length < 2) {
      await message.reply('❌ Please provide at least 2 valid options!');
      return;
    }

    // Remove empty options
    const validOptions = options.filter(option => option.trim().length > 0);
    
    if (validOptions.length < 2) {
      await message.reply('❌ Please provide at least 2 non-empty options!');
      return;
    }

    try {
      // Choose random option
      const randomIndex = Math.floor(Math.random() * validOptions.length);
      const chosenOption = validOptions[randomIndex];

      // Create choice embed
      const defaultColor = (config.embedColor as string) || '#2d0036';
      const embed = new EmbedBuilder()
        .setColor(defaultColor as any)
        .setTitle(`🎯 Random Choice`)
        .setDescription(`**Chooser:** ${message.author.toString()}`)
        .addFields(
          { 
            name: '📋 All Options', 
            value: validOptions.map((option, index) => `${index + 1}. ${option}`).join('\n'), 
            inline: false 
          },
          { 
            name: '🎉 Selected Option', 
            value: `**${chosenOption}**`, 
            inline: false 
          },
          { 
            name: '📊 Statistics', 
            value: `**Total Options:** ${validOptions.length}\n**Selection Method:** Random\n**Confidence:** ${(1 / validOptions.length * 100).toFixed(1)}%`, 
            inline: false 
          }
        )
        .setFooter({ 
          text: `Requested by ${message.author.tag} • Cybersecurity Decision Maker` 
        })
        .setTimestamp();

      // Add special messages for certain scenarios
      if (validOptions.length === 2) {
        embed.addFields({
          name: '🪙 Coin Flip Style',
          value: 'This was essentially a coin flip!',
          inline: false
        });
      } else if (validOptions.length >= 10) {
        embed.addFields({
          name: '🎲 Many Options',
          value: `That's a lot of choices! (${validOptions.length} options)`,
          inline: false
        });
      }

      await message.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error making choice:', error);
      await message.reply('❌ Failed to make choice. Please try again.');
    }
  }
};

export default choose; 