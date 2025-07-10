
import { Client, Collection, GatewayIntentBits, ActivityType } from 'discord.js';
import { Command, Event } from './types/command';
import { config } from './config';
import { Logger } from './utils/logger';

// Custom Discord client for the VoidRift bot.
// Extends the base Discord.js Client to add command/event management.
// If you want to add new features to the bot client, start here!

export class VoidriftClient extends Client 
{
  // Collections for commands, aliases, events, and cooldowns
  public commands: Collection<string, Command> = new Collection();
  public aliases: Collection<string, string> = new Collection();
  public events: Collection<string, Event> = new Collection();
  public cooldowns: Collection<string, Collection<string, number>> = new Collection();

  constructor() 
  {
    // Set up Discord.js client with required intents and mention settings
    super(
    {
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages
      ],
      allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: false
      }
    });
  }

  // Load a command into the bot
  public async start(): Promise<void> 
  {
    try 
    {
      Logger.info('Starting VoidRift Bot...');
      
      // Set presence
      this.on('ready', () => 
      {
        this.user?.setPresence(
        {
          status: config.presence.status,
          activities: [
          {
            name: config.presence.activity.name,
            type: config.presence.activity.type as ActivityType
          }]
        });
      });

      await this.login(config.token);
      Logger.success('Bot logged in successfully!');
    } catch (error) {
      Logger.error(`Failed to start bot: ${error}`);
      process.exit(1);
    }
  }

  // Load a command into the bot
  public async loadCommand(command: Command): Promise<void> 
  {
    this.commands.set(command.options.name, command);
    
    // Load aliases
    if (command.options.aliases) 
    {
      command.options.aliases.forEach(alias => {
        this.aliases.set(alias, command.options.name);
      });
    }
    
    Logger.debug(`Loaded command: ${command.options.name}`);
  }

  // Load an event into the bot
  public async loadEvent(event: Event): Promise<void> 
  {
    this.events.set(event.name, event);
    
    if (event.once) 
    {
      this.once(event.name, (...args) => event.execute(this, ...args));
    } else 
    {
      this.on(event.name, (...args) => event.execute(this, ...args));
    }
    
    Logger.debug(`Loaded event: ${event.name}`);
  }

  public async checkCooldown(userId: string, commandName: string, cooldownTime: number): Promise<boolean> 
  {
    if (!this.cooldowns.has(commandName)) 
    {
      this.cooldowns.set(commandName, new Collection());
    }

    const now = Date.now();
    const timestamps = this.cooldowns.get(commandName)!;
    const cooldownAmount = cooldownTime * 1000;

    if (timestamps.has(userId)) 
    {
      const expirationTime = timestamps.get(userId)! + cooldownAmount;
      
      if (now < expirationTime) 
      {
        return false; // Still on cooldown
      }
    }

    timestamps.set(userId, now);
    setTimeout(() => timestamps.delete(userId), cooldownAmount);
    
    return true; // Not on cooldown
  }
}