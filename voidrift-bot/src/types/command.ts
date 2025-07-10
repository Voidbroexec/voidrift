// Type definitions for commands and events in the VoidRift bot.
// If you want to add new command or event types, start here!

import { Message, SlashCommandBuilder, ChatInputCommandInteraction, PermissionResolvable } from 'discord.js';
import { VoidriftClient } from '../client';

// CommandOptions: Describes the structure and options for a command
export interface CommandOptions 
{
  name: string;
  description: string;
  category: string;
  aliases?: string[];
  usage?: string;
  examples?: string[];
  permissions?: PermissionResolvable[];
  ownerOnly?: boolean;
  guildOnly?: boolean;
  cooldown?: number;
  slashCommand?: boolean;
  slashData?: SlashCommandBuilder;
}

// CommandExecuteOptions: Parameters passed to a command's execute function
export interface CommandExecuteOptions 
{
  client: any;
  message?: Message;
  args?: string[];
  interaction?: ChatInputCommandInteraction;
}

// Event: Structure for an event handler
export interface Event 
{
  name: string;
  once?: boolean;
  execute: (client: VoidriftClient, ...args: any[]) => Promise<void>;
}

// BotConfig: Configuration for the bot
export interface BotConfig 
{
  token: string;
  adminIds: string[];
  adminRole?: string;
  prefix: string;
  embedColor: string;
  presence: 
  {
    status: 'online' | 'idle' | 'dnd' | 'invisible';
    activity: 
    {
      name: string;
      type: number;
    };
  };
}

// Command: Structure for a command module
export interface Command {
  options: {
    name: string;
    description: string;
    category?: string;
    aliases?: string[];
    usage?: string;
    examples?: string[];
    permissions?: PermissionResolvable[];
    ownerOnly?: boolean;
    guildOnly?: boolean;
    cooldown?: number;
    // Add more options as needed
  };
  execute: (options: CommandExecuteOptions) => Promise<void>;
}