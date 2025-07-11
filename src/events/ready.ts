import { Event } from '../types/command';
import { VoidriftClient } from '../client';
import { Logger } from '../utils/logger';
import { config } from '../config';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, TextChannel, PermissionFlagsBits } from 'discord.js';
import { fetchUpcomingCTFs } from '../utils/automationConfig';

const TICKET_PANEL_CHANNELS = (process.env.TICKET_PANEL_CHANNEL || '').split(',').map(id => id.trim()).filter(Boolean);
const CTF_CHANNEL_ID = process.env.CTF_CHANNEL_ID;

async function ensureTicketPanel(client: VoidriftClient) {
  for (const channelId of TICKET_PANEL_CHANNELS) {
    const channel = client.channels.cache.get(channelId) as TextChannel;
    if (!channel || channel.type !== ChannelType.GuildText) continue;
    // Check for recent bot message with the button
    const messages = await channel.messages.fetch({ limit: 10 });
    const hasPanel = messages.some(m => m.author.id === client.user?.id && (m.components as any[]).length > 0 && ((m.components as any[])[0].components as any[]).some((c: any) => c.customId === 'create_ticket'));
    if (hasPanel) continue;
    // Create the panel
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('create_ticket')
        .setLabel('Create Ticket')
        .setStyle(ButtonStyle.Primary)
    );
    await channel.send({
      content: 'Need help? Click below to create a private ticket!',
      components: [row]
    });
  }
}

// Scheduler: Post upcoming CTFs every 2 hours
async function postCTFs(client: VoidriftClient) {
  if (!CTF_CHANNEL_ID) return;
  const channel = client.channels.cache.get(CTF_CHANNEL_ID);
  if (!channel || channel.type !== ChannelType.GuildText) return;
  const ctfs = await fetchUpcomingCTFs(5);
  if (!ctfs.length) return;
  let msg = '**Upcoming Public CTFs:**\n';
  for (const ctf of ctfs) {
    msg += `\n[${ctf.title}](${ctf.url})\n`;
    msg += `🗓️ ${ctf.start.toUTCString()} — ${ctf.finish.toUTCString()}\n`;
    msg += `Format: ${ctf.format} | Location: ${ctf.onsite ? ctf.location : 'Online'}\n`;
    if (ctf.description) msg += `${ctf.description.substring(0, 200)}...\n`;
  }
  await (channel as TextChannel).send({ content: msg });
}

const ready: Event = 
{
  name: 'ready',
  once: true,
  execute: async (client: VoidriftClient) => 
  {
    Logger.success(`Bot is ready! Logged in as ${client.user?.tag}`);
    Logger.info(`Serving ${client.guilds.cache.size} guilds with ${client.commands.size} commands`);
    // Auto-create ticket panel if missing
    await ensureTicketPanel(client);
    // Start auto command runner if present
    try {
      const { startAutoCommandRunner } = await import('./message');
      startAutoCommandRunner(client);
    } catch {}
    
    // Start the CTF scheduler after bot is ready
    setInterval(() => {
      try {
        postCTFs(client);
      } catch {}
    }, 2 * 60 * 60 * 1000); // every 2 hours

    // Also post once on startup
    setTimeout(() => {
      try {
        postCTFs(client);
      } catch {}
    }, 10_000);

    // Optional: Set up any periodic tasks here
    setInterval(() => 
    {
      // Example: Log bot stats every hour
      Logger.info(`Bot Stats - Guilds: ${client.guilds.cache.size}, Users: ${client.users.cache.size}`);
    }, 3600000); // 1 hour
  }
};

export default ready;