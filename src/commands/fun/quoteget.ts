import { Command, CommandExecuteOptions } from '../../types/command';
import { EmbedBuilder } from 'discord.js';
import { config } from '../../config';
import fs from 'fs-extra';
import * as path from 'path';

/**
 * Quoteget command - retrieve random quotes from the collection
 * Fun command for cybersecurity/IT communities to share wisdom
 */
const quoteget: Command = {
  options: {
    name: 'quoteget',
    description: 'Get a random quote from the community collection.',
    category: 'fun',
    usage: '/quoteget [author]',
    examples: ['/quoteget', '/quoteget Bruce Schneier', '/quoteget Sun Tzu']
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message) return;

    try {
      // Load quotes
      const quotesPath = path.join(process.cwd(), 'data', 'quotes.json');
      let quotes: Array<{ quote: string; author: string; addedBy: string; timestamp: number }> = [];
      
      try {
        if (await fs.pathExists(quotesPath)) {
          const quotesData = await fs.readFile(quotesPath, 'utf8');
          quotes = JSON.parse(quotesData);
        }
      } catch (error) {
        console.error('Error loading quotes:', error);
        quotes = [];
      }

      if (quotes.length === 0) {
        const embed = new EmbedBuilder()
          .setColor('#ff6b6b')
          .setTitle('📚 No Quotes Available')
          .setDescription('No quotes have been added to the collection yet.\nUse `/quoteadd` to add the first quote!')
          .setFooter({ text: `Requested by ${message.author.tag}` })
          .setTimestamp();
        
        await message.reply({ embeds: [embed] });
        return;
      }

      // Filter by author if specified
      let filteredQuotes = quotes;
      if (args && args.length > 0) {
        const searchAuthor = args.join(' ').toLowerCase();
        filteredQuotes = quotes.filter(q => 
          q.author.toLowerCase().includes(searchAuthor)
        );

        if (filteredQuotes.length === 0) {
          const embed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle('🔍 No Quotes Found')
            .setDescription(`No quotes found for author: **${args.join(' ')}**\n\n**Available authors:** ${[...new Set(quotes.map(q => q.author))].slice(0, 10).join(', ')}${quotes.length > 10 ? '...' : ''}`)
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setTimestamp();
          
          await message.reply({ embeds: [embed] });
          return;
        }
      }

      // Select random quote
      const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
      const selectedQuote = filteredQuotes[randomIndex];

      // Create quote embed
      const defaultColor = (config.embedColor as string) || '#2d0036';
      const embed = new EmbedBuilder()
        .setColor(defaultColor as any)
        .setTitle(`💬 Random Quote`)
        .setDescription(`*"${selectedQuote.quote}"*`)
        .addFields(
          { 
            name: '👤 Author', 
            value: `**${selectedQuote.author}**`, 
            inline: true 
          },
          { 
            name: '📅 Added', 
            value: `<t:${Math.floor(selectedQuote.timestamp / 1000)}:R>`, 
            inline: true 
          },
          { 
            name: '👤 Added By', 
            value: selectedQuote.addedBy, 
            inline: true 
          },
          { 
            name: '📊 Collection Stats', 
            value: `**Total Quotes:** ${quotes.length}\n**Filtered Results:** ${filteredQuotes.length}\n**Quote ID:** #${quotes.indexOf(selectedQuote) + 1}`, 
            inline: false 
          }
        )
        .setFooter({ 
          text: `Requested by ${message.author.tag} • Cybersecurity Quote Collection` 
        })
        .setTimestamp();

      // Add special styling for famous cybersecurity authors
      const famousAuthors = ['bruce schneier', 'sun tzu', 'kevin mitnick', 'clifford stoll'];
      if (famousAuthors.includes(selectedQuote.author.toLowerCase())) {
        embed.addFields({
          name: '🏆 Famous Author',
          value: 'This quote is from a renowned cybersecurity expert!',
          inline: false
        });
        embed.setColor('#ffd43b');
      }

      await message.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error getting quote:', error);
      await message.reply('❌ Failed to retrieve quote. Please try again.');
    }
  }
};

export default quoteget; 