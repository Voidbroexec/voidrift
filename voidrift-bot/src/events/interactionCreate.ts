import { Event } from '../types/command';
import { ButtonInteraction, ChannelType, TextChannel, AttachmentBuilder, GuildMember, CategoryChannel, OverwriteResolvable, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { config } from '../config';
import { PermissionChecker } from '../utils/permcheck';
import { Logger } from '../utils/logger';

const TICKET_ARCHIVE_CATEGORY = process.env.TICKET_ARCHIVE_CATEGORY;
const TICKET_ACTIVE_CATEGORY = process.env.TICKET_ACTIVE_CATEGORY;
const adminRoleId = config.adminRole || process.env.ADMIN_ROLE;

async function generateTranscript(channel: TextChannel) {
  const messages = await channel.messages.fetch({ limit: 100 });
  const sorted = Array.from(messages.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp);
  // TXT
  let txt = '';
  for (const msg of sorted) {
    txt += `[${new Date(msg.createdTimestamp).toLocaleString()}] ${msg.author.tag}: ${msg.content}\n`;
  }
  // MD
  let md = '';
  for (const msg of sorted) {
    md += `**${msg.author.tag}**: ${msg.content}\n`;
  }
  // HTML
  let html = '<html><body>';
  for (const msg of sorted) {
    html += `<div><b>${msg.author.tag}</b>: ${msg.content}</div>`;
  }
  html += '</body></html>';
  return {
    txt: Buffer.from(txt, 'utf8'),
    md: Buffer.from(md, 'utf8'),
    html: Buffer.from(html, 'utf8'),
  };
}

async function handleCreateTicket(interaction: ButtonInteraction) {
  if (!interaction.guild) return;
  const member = interaction.member as GuildMember;
  const username = member.user.username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const emoji = ['🎫', '📝', '🔒', '📩', '❓', '💬', '🆘', '📥'][Math.floor(Math.random() * 8)];
  const channelName = `ticket-${username}-${emoji}`;

  // Use TICKET_ACTIVE_CATEGORY from env
  let category: CategoryChannel | undefined = TICKET_ACTIVE_CATEGORY
    ? interaction.guild.channels.cache.get(TICKET_ACTIVE_CATEGORY) as CategoryChannel | undefined
    : undefined;
  if (!category) {
    // fallback: create if not found
    category = await interaction.guild.channels.create({
      name: 'tickets',
      type: ChannelType.GuildCategory
    }) as CategoryChannel;
  }

  // Check if user already has a ticket open
  const existing = category.children.cache.find(c => c.name.startsWith(`ticket-${username}`));
  if (existing) {
    await interaction.reply({ content: 'You already have an open ticket!', flags: MessageFlags.Ephemeral });
    return;
  }
  // Permissions: only user and admins can view
  const overwrites: OverwriteResolvable[] = [
    {
      id: interaction.guild.roles.everyone.id,
      deny: ["ViewChannel"]
    },
    {
      id: member.id,
      allow: ["ViewChannel", "SendMessages"]
    }
  ];
  if (adminRoleId) {
    overwrites.push({
      id: adminRoleId,
      allow: ["ViewChannel", "SendMessages"]
    });
  }
  const channel = await interaction.guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: category.id,
    permissionOverwrites: overwrites
  }) as TextChannel;
  const closeRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Close Ticket')
      .setStyle(ButtonStyle.Danger)
  );
  // Mention admin role in the welcome message
  const adminMention = adminRoleId ? `<@&${adminRoleId}>` : '';
  await channel.send({ content: `Welcome <@${member.id}>! ${adminMention} An admin will be with you shortly.`, components: [closeRow] });
  await interaction.reply({ content: `Your ticket has been created: <#${channel.id}>`, flags: MessageFlags.Ephemeral });
}

const interactionCreate: Event = {
  name: 'interactionCreate',
  execute: async (client, interaction) => {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        await interaction.reply({ content: 'Unknown command.', ephemeral: true });
        return;
      }
      const perm = await PermissionChecker.checkPermissions(command, undefined, interaction);
      if (!perm.hasPermission) {
        await interaction.reply({ content: 'Insufficient permissions.', ephemeral: true });
        return;
      }
      Logger.command(interaction.user.tag, command.options.name, interaction.guild?.name);
      try {
        await command.execute({ client, interaction });
      } catch (err) {
        Logger.error(`Error executing slash command ${command.options.name}: ${err}`);
        await interaction.reply({ content: 'An error occurred while executing this command.', ephemeral: true });
      }
      return;
    }
    if (!interaction.isButton()) return;
    if (interaction.customId === 'create_ticket') {
      await handleCreateTicket(interaction);
      return;
    }
    if (interaction.customId === 'close_ticket') {
      const channel = interaction.channel;
      if (!channel || channel.type !== ChannelType.GuildText) return;
      // Generate transcripts
      const transcript = await generateTranscript(channel as TextChannel);
      const files = [
        new AttachmentBuilder(transcript.txt, { name: 'transcript.txt' }),
        new AttachmentBuilder(transcript.md, { name: 'transcript.md' }),
        new AttachmentBuilder(transcript.html, { name: 'transcript.html' })
      ];
      try {
        await interaction.reply({ content: 'Ticket closed! Here are your transcripts:', files, flags: MessageFlags.Ephemeral });
      } catch {}
      try {
        await channel.send({ content: 'Ticket closed! Transcript files:', files });
      } catch {}
      // Move to archive category and rename channel
      if (TICKET_ARCHIVE_CATEGORY) {
        // Extract username and emoji from the original channel name
        const match = channel.name.match(/^ticket-([a-z0-9]+)-(.)$/);
        let closedName = channel.name;
        if (match) {
          closedName = `closed-ticket-${match[1]}-${match[2]}`;
        }
        await channel.setParent(TICKET_ARCHIVE_CATEGORY);
        await channel.setName(closedName);
        await channel.send('This ticket has been archived.');
      } else {
        await channel.send('No archive category set.');
      }
      // Remove close button and add download button only for admins
      const messages = await channel.messages.fetch({ limit: 10 });
      const closeMsg = messages.find((m: any) => m.components.length > 0 && m.components[0].components.some((c: any) => c.customId === 'close_ticket'));
      if (closeMsg) {
        // Check if the user closing is admin
        const closer = interaction.guild?.members.cache.get(interaction.user.id);
        const isAdmin = (closer && ((adminRoleId && closer.roles.cache.has(adminRoleId)) || (config.adminIds && config.adminIds.includes(closer.id)))) || false;
        if (isAdmin) {
          const downloadRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId('download_transcript')
              .setLabel('Download Transcript')
              .setStyle(ButtonStyle.Secondary)
          );
          await closeMsg.edit({ components: [downloadRow] });
        } else {
          await closeMsg.edit({ components: [] });
        }
      }
    }
    if (interaction.customId === 'download_transcript') {
      const channel = interaction.channel;
      if (!channel || channel.type !== ChannelType.GuildText) return;
      // Admin check
      const member = interaction.guild?.members.cache.get(interaction.user.id);
      const isAdmin = (member && ((adminRoleId && member.roles.cache.has(adminRoleId)) || (config.adminIds && config.adminIds.includes(member.id)))) || false;
      if (!isAdmin) {
        await interaction.reply({ content: 'Only admins can download the transcript.', flags: MessageFlags.Ephemeral });
        return;
      }
      const transcript = await generateTranscript(channel as TextChannel);
      const files = [
        new AttachmentBuilder(transcript.txt, { name: 'transcript.txt' }),
        new AttachmentBuilder(transcript.md, { name: 'transcript.md' }),
        new AttachmentBuilder(transcript.html, { name: 'transcript.html' })
      ];
      await interaction.reply({ content: 'Here is the transcript for this ticket:', files, flags: MessageFlags.Ephemeral });
    }
  }
};

export default interactionCreate; 