import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder } from 'discord.js';
import { config } from '../../config';

/**
 * Base64 command - encode and decode base64 strings
 * Useful for cybersecurity/IT communities to demonstrate encoding
 */
const base64: Command = {
  options: {
    name: 'base64',
    description: 'Encode text to base64 or decode base64 to text.',
    category: 'utility',
    usage: '/base64 [encode|decode] [text]',
    examples: ['/base64 encode hello', '/base64 decode aGVsbG8=']
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message) return;

    if (!args || args.length < 2) {
      await message.reply('❌ Please specify an operation and text! Usage: `/base64 [encode|decode] [text]`');
      return;
    }

    const operation = args[0].toLowerCase();
    const text = args.slice(1).join(' ');

    // Validate operation
    if (operation !== 'encode' && operation !== 'decode') {
      await message.reply('❌ Invalid operation! Please use: `encode` or `decode`');
      return;
    }

    // Check for sensitive content
    const sensitiveKeywords = ['password', 'passwd', 'secret', 'key', 'token', 'api', 'private'];
    const hasSensitiveContent = sensitiveKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );

    if (hasSensitiveContent) {
      await message.reply('⚠️ **Security Warning:** You\'re attempting to encode/decode potentially sensitive content. Consider using a test string instead.');
      return;
    }

    try {
      let result: string;
      let operationName: string;
      let originalText: string;

      if (operation === 'encode') {
        result = Buffer.from(text, 'utf8').toString('base64');
        operationName = 'Base64 Encode';
        originalText = text;
      } else {
        // Decode
        try {
          result = Buffer.from(text, 'base64').toString('utf8');
          operationName = 'Base64 Decode';
          originalText = text;
        } catch (decodeError) {
          await message.reply('❌ Invalid base64 string! Please check your input.');
          return;
        }
      }

      // Check if decoded result contains suspicious content
      if (operation === 'decode') {
        const suspiciousPatterns = [
          /https?:\/\/[^\s]+/g,  // URLs
          /discord\.gg\/[^\s]+/g, // Discord invites
          /<@!?\d+>/g,           // Discord mentions
          /<#\d+>/g,             // Discord channels
          /<@&\d+>/g             // Discord roles
        ];

        const hasSuspiciousPatterns = suspiciousPatterns.some(pattern => 
          pattern.test(result)
        );

        if (hasSuspiciousPatterns) {
          await message.reply('⚠️ **Security Warning:** The decoded content contains potentially suspicious patterns (URLs, Discord links, etc.).');
          return;
        }
      }

      // Create base64 embed
      const defaultColor = (config.embedColor as string) || '#2d0036';
      const embed = new EmbedBuilder()
        .setColor(defaultColor as any)
        .setTitle(`📝 ${operationName}`)
        .setDescription(`**Operation:** ${operationName}\n**Input:** \`${originalText}\``)
        .addFields(
          { 
            name: '📤 Output', 
            value: `\`\`\`${result}\`\`\``, 
            inline: false 
          },
          { 
            name: '📊 Information', 
            value: `**Input Length:** ${originalText.length} characters\n**Output Length:** ${result.length} characters\n**Operation:** ${operation}`, 
            inline: false 
          },
          { 
            name: '🔗 Quick Copy', 
            value: `\`${result}\``, 
            inline: false 
          }
        )
        .setFooter({ 
          text: `Requested by ${message.author.tag} • Cybersecurity Encoding Tool` 
        })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error processing base64:', error);
      await message.reply('❌ Failed to process base64. Please check your input and try again.');
    }
  }
};

export default base64; 