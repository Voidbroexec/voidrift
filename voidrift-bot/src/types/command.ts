
import { Message, SlashCommandBuilder, ChatInputCommandInteraction, PermissionResolvable } from 'discord.js';
import { VoidriftClient } from '../client';

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

export interface CommandExecuteOptions 
{
  client: VoidriftClient;
  message?: Message;
  interaction?: ChatInputCommandInteraction;
  args?: string[];
}

export interface Command 
{
  options: CommandOptions;
  execute: (options: CommandExecuteOptions) => Promise<void>;
}

export interface Event 
{
  name: string;
  once?: boolean;
  execute: (client: VoidriftClient, ...args: any[]) => Promise<void>;
}

export interface BotConfig 
{
  token: string;
  ownerId: string;
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