import { Command, CommandExecuteOptions } from '../../types/command';
import { CategoryChannel, ChannelType, PermissionFlagsBits, TextChannel } from 'discord.js';
import { config } from '../../config';

const TICKET_CATEGORY_NAME = 'tickets';

const ticket: Command = {
  options: {
    name: 'ticket',
    description: 'Create a private support/help ticket channel.',
    category: 'utility',
    usage: '/ticket [reason]'
  },
  execute: async ({ message, args, client }: CommandExecuteOptions) => {
    if (!message || !message.guild) return;
    const reason = args?.join(' ') || 'No reason provided';
    const username = message.author.username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const channelName = `ticket-${username}`;

    // Find or create the ticket category
    let category = message.guild.channels.cache.find(
      c => c.type === ChannelType.GuildCategory && c.name.toLowerCase() === TICKET_CATEGORY_NAME
    ) as CategoryChannel | undefined;
    if (!category) {
      category = await message.guild.channels.create({
        name: TICKET_CATEGORY_NAME,
        type: ChannelType.GuildCategory
      }) as CategoryChannel;
    }

    // Check if user already has a ticket open
    const existing = category.children.cache.find(c => c.name.startsWith(`ticket-${username}`));
    if (existing) {
      await message.reply('You already have an open ticket!');
      return;
    }

    // Permissions: only user and staff/admins can view
    const adminRoleId = config.adminRole;
    const overwrites = [
      {
        id: message.guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel]
      },
      {
        id: message.author.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
      }
    ];
    if (adminRoleId) {
      overwrites.push({
        id: adminRoleId,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
      });
    }

    const channel = await message.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites: overwrites
    }) as TextChannel;

    await channel.send({ content: `Welcome <@${message.author.id}>! Please describe your issue. Staff will be with you shortly.\nReason: ${reason}` });
    await message.reply(`Your ticket has been created: <#${channel.id}>`);
  }
};

export default ticket; 