import { Message, EmbedBuilder, TextChannel } from 'discord.js';
import { Event } from '../types/command';
import { VoidriftClient } from '../client';
import { config } from '../config';
import { Logger } from '../utils/logger';
import { PermissionChecker } from '../utils/permcheck';
import { automationConfig } from '../utils/automationConfig';
import { autoroflChannels } from '../commands/fun/autorofl';
import { isAFK, getAFK, clearAFK } from '../utils/afkStore';
// Import activeReacts from setreact command
import { activeReacts } from '../commands/presence/setreact';
import { dryModeChannels } from '../commands/presence/setreact';
import { addXp, getXp, getLevel, setLevel } from '../utils/xpStore';
import { canGainXp } from '../utils/xpCooldown';

const message: Event = 
{
  name: 'messageCreate',
  execute: async (client: VoidriftClient, message: Message) => 
  {
    // Ignore bots and system messages
    if (message.author.bot || message.system) return;

    // XP/Level system: Award XP for user messages (not bots, not system)
    if (!message.author.bot && message.guild && canGainXp(message.author.id)) {
      addXp(message.author.id, 10); // Award 10 XP per message
      const xp = getXp(message.author.id);
      const level = getLevel(message.author.id);
      const nextLevelXp = 100 * level; // Example: 100 XP per level
      if (xp >= nextLevelXp) {
        setLevel(message.author.id, level + 1);
        if (message.channel.type === 0) { // TextChannel
          await (message.channel as TextChannel).send(`<@${message.author.id}> leveled up to **${level + 1}**!`);
        }
        Logger.info(`User ${message.author.id} leveled up to ${level + 1}`);
      }
    }

    // --- Auto-react logic from setreact command ---
    // If this channel has an active auto-react, check limits and react
    const reactState = activeReacts[message.channel.id];
    if (reactState) {
      const now = Date.now();
      if (now <= reactState.expiresAt && reactState.remainingMessages > 0) {
        try {
          await message.react(reactState.emoji);
        } catch (err) {
          Logger.error(`Failed to auto-react (setreact): ${err}`);
        }
        reactState.remainingMessages--;
        // If time or message count is up, remove the state
        if (now > reactState.expiresAt || reactState.remainingMessages <= 0) {
          delete activeReacts[message.channel.id];
        }
      } else {
        // Time or count expired, clean up
        delete activeReacts[message.channel.id];
      }
    }
    // --- End auto-react logic ---

    // AFK: Clear AFK if user was AFK and sends a message
    if (isAFK(message.author.id)) {
      clearAFK(message.author.id);
      await message.reply('Welcome back! Your AFK status has been removed.');
    }

    // AFK: Notify if mentioned user is AFK
    if (message.mentions.users.size > 0) {
      for (const [, user] of message.mentions.users) {
        if (isAFK(user.id)) {
          const afk = getAFK(user.id);
          await message.reply(`${user.tag} is currently AFK: ${afk?.reason}`);
        }
      }
    }

    // Global auto-react if set
    if (automationConfig.globalReactEmoji) {
      try {
        await message.react(automationConfig.globalReactEmoji);
      } catch (err) {
        Logger.error(`Failed to auto-react globally: ${err}`);
      }
    } else {
      // Auto-react with 🤣 if autorofl is enabled in this channel
      if (autoroflChannels.has(message.channelId)) {
        try {
          await message.react('🤣');
        } catch (err) {
          Logger.error(`Failed to auto-react with 🤣: ${err}`);
        }
      }
      // Dry text triggers (per-channel dry mode)
      if (
        dryModeChannels[message.channel.id] &&
        automationConfig.dryEmoji &&
        automationConfig.dryTriggers.length > 0 &&
        automationConfig.dryTriggers.some(trigger => message.content.toLowerCase().trim() === trigger)
      ) {
        try {
          await message.react(automationConfig.dryEmoji);
        } catch (err) {
          Logger.error(`Failed to auto-react with dryEmoji: ${err}`);
        }
      }
    }

    // Remove all message-based command handling. Optionally, inform users to use slash commands.
    if (message.content.startsWith('/')) {
      await message.reply('All commands are now slash commands. Please use the Discord slash command menu (type /).');
      return;
    }
  }
};

export function startAutoCommandRunner(client: VoidriftClient) {
  setInterval(async () => {
    if (!automationConfig.autoCommands) return;
    const now = Date.now();
    for (const auto of automationConfig.autoCommands) {
      if (now >= auto.nextRun) {
        const channel = client.channels.cache.get(auto.channelId);
        if (channel && channel.type === 0 && 'send' in channel) {
          try {
            await (channel as TextChannel).send(auto.command);
          } catch (err) {}
        }
        auto.nextRun = now + auto.intervalMs;
      }
    }
  }, 10000); // check every 10 seconds
}

export default message;