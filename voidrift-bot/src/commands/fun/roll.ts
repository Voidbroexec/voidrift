import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder } from 'discord.js';
import { config } from '../../config';

/**
 * Roll command - simulate dice rolls
 * Fun command for cybersecurity/IT communities to relax and play games
 */
const roll: Command = {
  options: {
    name: 'roll',
    description: 'Roll dice with customizable sides and count.',
    category: 'fun',
    usage: '/roll [dice] [sides]',
    examples: ['/roll 1d6', '/roll 2d20', '/roll 3d10']
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message) return;

    // Parse dice notation (e.g., "2d20" or "1d6")
    let diceCount = 1;
    let sides = 6;

    if (args && args.length > 0) {
      const diceNotation = args[0].toLowerCase();
      const match = diceNotation.match(/^(\d+)d(\d+)$/);
      
      if (match) {
        diceCount = parseInt(match[1]);
        sides = parseInt(match[2]);
        
        // Validate input
        if (diceCount < 1 || diceCount > 100) {
          await message.reply('❌ Number of dice must be between 1 and 100!');
          return;
        }
        
        if (sides < 2 || sides > 1000) {
          await message.reply('❌ Number of sides must be between 2 and 1000!');
          return;
        }
      } else {
        await message.reply('❌ Invalid dice notation! Use format: `XdY` (e.g., `2d20`, `1d6`)');
        return;
      }
    }

    try {
      // Roll the dice
      const rolls: number[] = [];
      let total = 0;
      
      for (let i = 0; i < diceCount; i++) {
        const roll = Math.floor(Math.random() * sides) + 1;
        rolls.push(roll);
        total += roll;
      }

      // Determine roll quality
      let quality = '';
      let qualityColor = '';
      
      if (diceCount === 1) {
        if (rolls[0] === 1) {
          quality = '💀 Critical Failure!';
          qualityColor = '#ff6b6b';
        } else if (rolls[0] === sides) {
          quality = '🎯 Critical Success!';
          qualityColor = '#51cf66';
        } else if (rolls[0] >= sides * 0.8) {
          quality = '🔥 Great Roll!';
          qualityColor = '#ffd43b';
        } else if (rolls[0] <= sides * 0.2) {
          quality = '😅 Poor Roll!';
          qualityColor = '#ff922b';
        }
      } else {
        const average = total / diceCount;
        const maxPossible = sides;
        const percentage = (average / maxPossible) * 100;
        
        if (percentage >= 90) {
          quality = '🔥 Excellent Rolls!';
          qualityColor = '#51cf66';
        } else if (percentage >= 75) {
          quality = '👍 Good Rolls!';
          qualityColor = '#ffd43b';
        } else if (percentage <= 25) {
          quality = '😅 Poor Rolls!';
          qualityColor = '#ff922b';
        }
      }

      // Create roll embed
      const defaultColor = (config.embedColor as string) || '#2d0036';
      const embed = new EmbedBuilder()
        .setColor(qualityColor || defaultColor as any)
        .setTitle(`🎲 Dice Roll: ${diceCount}d${sides}`)
        .setDescription(`**Roller:** ${message.author.toString()}`)
        .addFields(
          { 
            name: '📊 Roll Results', 
            value: diceCount === 1 ? 
              `**Result:** ${rolls[0]}` : 
              `**Individual Rolls:** ${rolls.join(', ')}\n**Total:** ${total}`, 
            inline: false 
          },
          { 
            name: '📈 Statistics', 
            value: `**Dice:** ${diceCount}d${sides}\n**Range:** 1-${sides}\n**Average:** ${(total / diceCount).toFixed(1)}`, 
            inline: false 
          }
        )
        .setFooter({ 
          text: `Requested by ${message.author.tag} • Cybersecurity Dice Roller` 
        })
        .setTimestamp();

      // Add quality indicator if available
      if (quality) {
        embed.addFields({
          name: '🎯 Roll Quality',
          value: quality,
          inline: false
        });
      }

      // Add special messages for common dice
      if (diceCount === 1 && sides === 20) {
        embed.addFields({
          name: '🎭 D&D Style',
          value: rolls[0] === 20 ? '🎯 **NATURAL 20!** Perfect success!' : 
                 rolls[0] === 1 ? '💀 **NATURAL 1!** Critical failure!' : '',
          inline: false
        });
      }

      await message.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error rolling dice:', error);
      await message.reply('❌ Failed to roll dice. Please try again.');
    }
  }
};

export default roll; 