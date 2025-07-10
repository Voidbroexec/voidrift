import { EmbedBuilder,ColorResolvable  } from 'discord.js';
import { Command } from '../../types/command';
import { config } from '../../config';

const ping: Command = 
{
  options: 
  {
    name: 'ping',
    description: 'Check bot latency and response time',
    category: 'utility',
    aliases: ['pong', 'latency'],
    cooldown: 5
  },
  
  execute: async ({ client, message }) => 
  {
    if (!message) return;

    const sent = await message.reply('🏓 Pinging...');
    
    const botLatency = sent.createdTimestamp - message.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);

    const defaultColor = (config.embedColor as string) || '#2d0036';
    const embed = new EmbedBuilder()
      .setColor(defaultColor as any)
      .setTitle('🏓 Pong!')
      .addFields
      (
        { name: '📡 Bot Latency', value: `${botLatency}ms`, inline: true },
        { name: '🌐 API Latency', value: `${apiLatency}ms`, inline: true },
        { name: '⏱️ Uptime', value: `${Math.floor(client.uptime! / 1000 / 60)} minutes`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: `Requested by ${message.author.tag}` });

    await sent.edit({ content: '', embeds: [embed] });
  }
};

export default ping;