import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder } from 'discord.js';
import { config } from '../../config';
import fs from 'fs-extra';
import * as path from 'path';

/**
 * Quoteadd command - add quotes to the collection
 * Fun command for cybersecurity/IT communities to share wisdom
 */
const quoteadd: Command = {
  options: {
    name: 'quoteadd',
    description: 'Add a quote to the community quote collection.',
    category: 'fun',
    usage: '/quoteadd [quote] [author]',
    examples: ['/quoteadd "Security is not a product, it is a process" Bruce Schneier', '/quoteadd "The best defense is a good offense" Sun Tzu']
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message) return;

    if (!args || args.length < 2) {
      await message.reply('❌ Please provide a quote and author! Usage: `/quoteadd [quote] [author]`');
      return;
    }

    // Parse quote and author
    let quote = '';
    let author = '';
    let inQuotes = false;
    let quoteEnded = false;

    for (const arg of args) {
      if (arg.startsWith('"') && arg.endsWith('"') && !inQuotes) {
        // Complete quoted quote
        quote = arg.slice(1, -1);
        quoteEnded = true;
      } else if (arg.startsWith('"') && !inQuotes) {
        // Start of quoted quote
        inQuotes = true;
        quote = arg.slice(1);
      } else if (arg.endsWith('"') && inQuotes) {
        // End of quoted quote
        inQuotes = false;
        quote += ' ' + arg.slice(0, -1);
        quoteEnded = true;
      } else if (inQuotes) {
        // Middle of quoted quote
        quote += ' ' + arg;
      } else if (quoteEnded) {
        // Author (everything after quote)
        author += (author ? ' ' : '') + arg;
      } else {
        // Still building quote
        quote += (quote ? ' ' : '') + arg;
      }
    }

    // Validate input
    if (!quote.trim()) {
      await message.reply('❌ Please provide a valid quote!');
      return;
    }

    if (!author.trim()) {
      author = 'Unknown';
    }

    // Check for inappropriate content
    const inappropriateKeywords = ['hack', 'crack', 'steal', 'illegal', 'malware', 'virus'];
    const hasInappropriateContent = inappropriateKeywords.some(keyword => 
      quote.toLowerCase().includes(keyword) || author.toLowerCase().includes(keyword)
    );

    if (hasInappropriateContent) {
      await message.reply('⚠️ **Content Warning:** Your quote may contain inappropriate content. Please review and try again.');
      return;
    }

    try {
      // Load existing quotes
      const quotesPath = path.join(process.cwd(), 'data', 'quotes.json');
      let quotes: Array<{ quote: string; author: string; addedBy: string; timestamp: number }> = [];
      
      try {
        await fs.ensureDir(path.dirname(quotesPath));
        if (await fs.pathExists(quotesPath)) {
          const quotesData = await fs.readFile(quotesPath, 'utf8');
          quotes = JSON.parse(quotesData);
        }
      } catch (error) {
        console.error('Error loading quotes:', error);
        quotes = [];
      }

      // Check for duplicate quotes
      const isDuplicate = quotes.some(q => 
        q.quote.toLowerCase() === quote.toLowerCase() && 
        q.author.toLowerCase() === author.toLowerCase()
      );

      if (isDuplicate) {
        await message.reply('❌ This quote already exists in the collection!');
        return;
      }

      // Add new quote
      const newQuote = {
        quote: quote.trim(),
        author: author.trim(),
        addedBy: message.author.tag,
        timestamp: Date.now()
      };

      quotes.push(newQuote);

      // Save quotes
      await fs.writeFile(quotesPath, JSON.stringify(quotes, null, 2));

      // Create success embed
      const defaultColor = (config.embedColor as string) || '#2d0036';
      const embed = new EmbedBuilder()
        .setColor(defaultColor as any)
        .setTitle(`💬 Quote Added Successfully`)
        .setDescription(`**Quote:** "${newQuote.quote}"\n**Author:** ${newQuote.author}`)
        .addFields(
          { 
            name: '📊 Quote Information', 
            value: `**Added By:** ${newQuote.addedBy}\n**Total Quotes:** ${quotes.length}\n**Quote ID:** #${quotes.length}`, 
            inline: false 
          },
          { 
            name: '💡 Cybersecurity Wisdom', 
            value: 'Your quote has been added to the community collection. Use `/quoteget` to retrieve random quotes!', 
            inline: false 
          }
        )
        .setFooter({ 
          text: `Requested by ${message.author.tag} • Cybersecurity Quote Collection` 
        })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error adding quote:', error);
      await message.reply('❌ Failed to add quote. Please try again.');
    }
  }
};

export default quoteadd; 