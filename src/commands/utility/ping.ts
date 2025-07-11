import { EmbedBuilder, ColorResolvable, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../types/command';
import { config } from '../../config';

const ping: Command = 
{
  options: {
    name: 'ping',
    description: 'Check bot latency and response time',
    category: 'utility',
    aliases: ['pong', 'latency'],
    cooldown: 5,
    slashCommand: true,
    slashData: new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Check bot latency and response time'),
  },
  
  execute: async ({ client, message, interaction }) => {
    // Slash command handling
    if (!message && interaction) {
      await interaction.reply('🏓 Pinging...');
      const sent = await interaction.fetchReply();

      const botLatency = sent.createdTimestamp - interaction.createdTimestamp;
      const apiLatency = Math.round(client.ws.ping);

      const defaultColor = (config.embedColor as string) || '#2d0036';
      const embed = new EmbedBuilder()
        .setColor(defaultColor as ColorResolvable)
        .setTitle('🏓 Pong!')
        .addFields(
          { name: '📡 Bot Latency', value: `${botLatency}ms`, inline: true },
          { name: '🌐 API Latency', value: `${apiLatency}ms`, inline: true },
          { name: '⏱️ Uptime', value: `${Math.floor(client.uptime! / 1000 / 60)} minutes`, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.tag}` });

      await interaction.editReply({ content: '', embeds: [embed] });
      return;
    }

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