import { Message } from 'discord.js';
import { Event } from '../types/command';
import { VoidriftClient } from '../client';
import { automationConfig } from '../utils/automationConfig';
import { config } from '../config';
import { CategoryChannel, ChannelType, PermissionFlagsBits, ButtonInteraction, GuildMember, OverwriteResolvable } from 'discord.js';

const TICKET_EMOJIS = ['🎫', '📝', '🔒', '📩', '❓', '💬', '🆘', '📥'];

async function handleCreateTicket(interaction: ButtonInteraction) {
  if (!interaction.guild) return;
  const member = interaction.member as GuildMember;
  const username = member.user.username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const emoji = TICKET_EMOJIS[Math.floor(Math.random() * TICKET_EMOJIS.length)];
  const channelName = `ticket-${username}-${emoji}`;

  // Use TICKET_ACTIVE_CATEGORY from env
  const TICKET_ACTIVE_CATEGORY = process.env.TICKET_ACTIVE_CATEGORY;
  let category = TICKET_ACTIVE_CATEGORY
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
    await interaction.reply({ content: 'You already have an open ticket!', ephemeral: true });
    return;
  }
  // Permissions: only user and admins can view
  const adminRoleId = config.adminRole;
  const overwrites: OverwriteResolvable[] = [
    {
      id: interaction.guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel]
    },
    {
      id: member.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
    }
  ];
  if (adminRoleId) {
    overwrites.push({
      id: adminRoleId,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
    });
  }
  const channel = await interaction.guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: category.id,
    permissionOverwrites: overwrites
  });
  const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const closeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Close Ticket')
      .setStyle(ButtonStyle.Danger)
  );
  await channel.send({ content: `Welcome <@${member.id}>! An admin will be with you shortly.`, components: [closeRow] });
  await interaction.reply({ content: `Your ticket has been created: <#${channel.id}>`, ephemeral: true });
}

const automation: Event = {
  name: 'messageCreate',
  execute: async (client: VoidriftClient, message: Message) => {
    if (!client.user) return;
    if (automationConfig.stealth) return;

    // Smart DND Auto-Responder
    if (client.user.presence?.status === 'dnd') {
      const isDM = message.channel.isDMBased();
      const mentionsBot = message.mentions.has(client.user);
      if ((isDM || mentionsBot) && message.author.id !== client.user.id) {
        try {
          await message.reply(automationConfig.dndMessage);
        } catch {
          // ignore
        }
      }
    }

    // Auto Emoji Reaction for Dry Text
    if (message.author.id === client.user.id) {
      const content = message.content.toLowerCase().trim();
      if (automationConfig.dryTriggers.includes(content)) {
        try {
          await message.react(automationConfig.dryEmoji);
        } catch {
          // ignore
        }
      }
    }

    // Per-user triggers
    const trigger = automationConfig.userTriggers[message.author.id];
    if (trigger && message.author.id !== client.user.id) {
      if (trigger.autoReply) {
        try {
          await message.reply(trigger.autoReply);
        } catch {
          // ignore
        }
      }
      if (trigger.reactEmoji) {
        try {
          await message.react(trigger.reactEmoji);
        } catch {
          // ignore
        }
      }
    }
  }
};

export default automation;
