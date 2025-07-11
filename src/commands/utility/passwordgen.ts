import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder } from 'discord.js';
import { config } from '../../config';
import { randomBytes, randomInt } from 'crypto';

/**
 * Passwordgen command - generate strong passwords
 * Essential for cybersecurity/IT communities to demonstrate password security
 */
const passwordgen: Command = {
  options: {
    name: 'passwordgen',
    description: 'Generate a strong password with customizable options.',
    category: 'utility',
    usage: '/passwordgen [length] [options]',
    examples: ['/passwordgen 16', '/passwordgen 20 strong', '/passwordgen 12 simple']
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message) return;

    // Parse arguments
    let length = 16; // Default length
    let strength = 'strong'; // Default strength

    if (args && args.length > 0) {
      const lengthArg = parseInt(args[0]);
      if (!isNaN(lengthArg) && lengthArg >= 8 && lengthArg <= 64) {
        length = lengthArg;
      } else if (lengthArg < 8) {
        await message.reply('❌ Password length must be at least 8 characters!');
        return;
      } else if (lengthArg > 64) {
        await message.reply('❌ Password length cannot exceed 64 characters!');
        return;
      }
    }

    if (args && args.length > 1) {
      const strengthArg = args[1].toLowerCase();
      if (['simple', 'strong', 'very-strong'].includes(strengthArg)) {
        strength = strengthArg;
      }
    }

    try {
      // Generate password based on strength
      let password: string;
      let charset: string;
      let strengthInfo: string;

      switch (strength) {
        case 'simple':
          charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          strengthInfo = '🔵 **Simple** - Letters and numbers only';
          break;
        case 'strong':
          charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
          strengthInfo = '🟡 **Strong** - Letters, numbers, and common symbols';
          break;
        case 'very-strong':
          charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
          strengthInfo = '🟢 **Very Strong** - Full character set with special symbols';
          break;
        default:
          charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
          strengthInfo = '🟡 **Strong** - Letters, numbers, and common symbols';
      }

      // Generate password
      password = '';
      for (let i = 0; i < length; i++) {
        password += charset[randomInt(charset.length)];
      }

      // Calculate password strength score
      let score = 0;
      if (password.match(/[a-z]/)) score += 1; // lowercase
      if (password.match(/[A-Z]/)) score += 1; // uppercase
      if (password.match(/[0-9]/)) score += 1; // numbers
      if (password.match(/[^a-zA-Z0-9]/)) score += 1; // special chars
      if (password.length >= 12) score += 1; // length bonus

      const scoreText = score >= 4 ? '🟢 Excellent' : score >= 3 ? '🟡 Good' : score >= 2 ? '🟠 Fair' : '🔴 Weak';

      // Create password embed
      const defaultColor = (config.embedColor as string) || '#2d0036';
      const embed = new EmbedBuilder()
        .setColor(defaultColor as any)
        .setTitle(`🔐 Generated Password`)
        .setDescription(`**Length:** ${length} characters\n**Strength:** ${strengthInfo}`)
        .addFields(
          { 
            name: '🔑 Password', 
            value: `\`\`\`${password}\`\`\``, 
            inline: false 
          },
          { 
            name: '📊 Security Analysis', 
            value: `**Strength Score:** ${scoreText} (${score}/5)\n**Entropy:** ~${Math.log2(charset.length) * length} bits\n**Character Set:** ${charset.length} characters`, 
            inline: false 
          },
          { 
            name: '🔗 Quick Copy', 
            value: `\`${password}\``, 
            inline: false 
          },
          { 
            name: '💡 Security Tips', 
            value: '• Use a password manager\n• Enable 2FA when possible\n• Never share passwords\n• Use unique passwords for each service', 
            inline: false 
          }
        )
        .setFooter({ 
          text: `Requested by ${message.author.tag} • Cybersecurity Password Generator` 
        })
        .setTimestamp();

      // Add warning color for weak passwords
      if (score < 3) {
        embed.setColor('#ff6b6b');
      }

      await message.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error generating password:', error);
      await message.reply('❌ Failed to generate password. Please try again.');
    }
  }
};

export default passwordgen; 