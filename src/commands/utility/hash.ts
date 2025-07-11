import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder } from 'discord.js';
import { config } from '../../config';
import { createHash } from 'crypto';

/**
 * Hash command - hash strings using various algorithms
 * Essential for cybersecurity/IT communities to demonstrate hashing
 */
const hash: Command = {
  options: {
    name: 'hash',
    description: 'Hash a string using MD5, SHA1, or SHA256 algorithms.',
    category: 'utility',
    usage: '/hash [algorithm] [text]',
    examples: ['/hash md5 hello', '/hash sha256 password123', '/hash sha1 test']
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message) return;

    if (!args || args.length < 2) {
      await message.reply('❌ Please specify an algorithm and text! Usage: `/hash [md5|sha1|sha256] [text]`');
      return;
    }

    const algorithm = args[0].toLowerCase();
    const text = args.slice(1).join(' ');

    // Validate algorithm
    const validAlgorithms = ['md5', 'sha1', 'sha256'];
    if (!validAlgorithms.includes(algorithm)) {
      await message.reply('❌ Invalid algorithm! Please use: `md5`, `sha1`, or `sha256`');
      return;
    }

    // Check for sensitive content
    const sensitiveKeywords = ['password', 'passwd', 'secret', 'key', 'token', 'api'];
    const hasSensitiveContent = sensitiveKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );

    if (hasSensitiveContent) {
      await message.reply('⚠️ **Security Warning:** You\'re attempting to hash potentially sensitive content. Consider using a test string instead.');
      return;
    }

    try {
      // Generate hash
      const hash = createHash(algorithm).update(text).digest('hex');
      
      // Get algorithm info
      const algorithmInfo = {
        md5: { name: 'MD5', security: '⚠️ **Deprecated** - Not cryptographically secure', length: 32 },
        sha1: { name: 'SHA-1', security: '⚠️ **Weak** - Vulnerable to collision attacks', length: 40 },
        sha256: { name: 'SHA-256', security: '✅ **Secure** - Currently cryptographically secure', length: 64 }
      };

      const info = algorithmInfo[algorithm as keyof typeof algorithmInfo];

      // Create hash embed
      const defaultColor = (config.embedColor as string) || '#2d0036';
      const embed = new EmbedBuilder()
        .setColor(defaultColor as any)
        .setTitle(`🔐 Hash Result: ${info.name}`)
        .setDescription(`**Algorithm:** ${info.name}\n**Input:** \`${text}\``)
        .addFields(
          { 
            name: '🔑 Hash Output', 
            value: `\`\`\`${hash}\`\`\``, 
            inline: false 
          },
          { 
            name: '📊 Hash Information', 
            value: `**Length:** ${hash.length} characters\n**Expected:** ${info.length} characters\n**Security:** ${info.security}`, 
            inline: false 
          },
          { 
            name: '🔗 Quick Copy', 
            value: `\`${hash}\``, 
            inline: false 
          }
        )
        .setFooter({ 
          text: `Requested by ${message.author.tag} • Cybersecurity Hash Tool` 
        })
        .setTimestamp();

      // Add warning color for weak algorithms
      if (algorithm === 'md5' || algorithm === 'sha1') {
        embed.setColor('#ff6b6b');
      }

      await message.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error generating hash:', error);
      await message.reply('❌ Failed to generate hash. Please try again.');
    }
  }
};

export default hash; 