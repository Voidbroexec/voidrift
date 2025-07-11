// Loader for commands and events in the VoidRift bot.
// Dynamically loads all commands and events from the filesystem.
// If you want to add or change how commands/events are loaded, start here!

import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { VoidriftClient } from './client';
import { Command, Event } from './types/command';
import { Logger } from './utils/logger';

export class Loader 
{
  // Reference to the bot client
  private readonly client: VoidriftClient;

  constructor(client: VoidriftClient) 
  {
    this.client = client;
  }

  // Check if an object is a valid event
  private isValidEvent(event: any): event is Event {
    return (
      event &&
      typeof event === 'object' &&
      typeof event.name === 'string' &&
      typeof event.execute === 'function'
    );
  }

  // Check if an object is a valid command
  private isValidCommand(command: any): command is Command {
    return (
      command &&
      typeof command === 'object' &&
      command.options &&
      typeof command.options.name === 'string' &&
      typeof command.options.description === 'string' &&
      typeof command.options.category === 'string' &&
      typeof command.execute === 'function'
    );
  }

  // Load all commands from the commands directory
  public async loadCommands(): Promise<void> 
  {
    const commandsPath = join(__dirname, 'commands');
    let commandCount = 0;

    try 
    {
      const categories = readdirSync(commandsPath).filter(dir => 
        statSync(join(commandsPath, dir)).isDirectory()
      );

      for (const category of categories) {
        const categoryPath = join(commandsPath, category);
        const commandFiles = readdirSync(categoryPath).filter(file =>
          file.endsWith('.js') && !file.endsWith('.d.ts')
        );

        for (const file of commandFiles) 
        {
          try 
          {
            const commandPath = join(categoryPath, file);
            delete require.cache[require.resolve(commandPath)];
            
            const commandModule = await import(commandPath);
            const command: Command = commandModule.default ?? commandModule;

            if (this.isValidCommand(command)) 
            {
              await this.client.loadCommand(command);
              commandCount++;
            } else 
            {
              Logger.warn(`Invalid command structure in ${category}/${file}`);
            }
          } catch (error) 
          {
            Logger.error(`Failed to load command ${category}/${file}: ${error instanceof Error ? error.stack : error}`);
          }
        }
      }

      Logger.success(`Loaded ${commandCount} commands from ${categories.length} categories`);
    } catch (error) 
    {
      Logger.error(`Failed to load commands: ${error instanceof Error ? error.stack : error}`);
    }
  }

  // Load all events from the events directory
  public async loadEvents(): Promise<void> 
  {
    const eventsPath = join(__dirname, 'events');
    let eventCount = 0;

    try 
    {
      const eventFiles = readdirSync(eventsPath).filter(file =>
        file.endsWith('.js') && !file.endsWith('.d.ts')
      );

      for (const file of eventFiles) 
      {
        try 
        {
          const eventPath = join(eventsPath, file);
          delete require.cache[require.resolve(eventPath)];
          
          const eventModule = await import(eventPath);
          const event: Event = eventModule.default ?? eventModule;

          if (this.isValidEvent(event)) 
          {
            await this.client.loadEvent(event);
            eventCount++;
          } else 
          {
            Logger.warn(`Invalid event structure in ${file}`);
          }
        } catch (error) 
        {
          Logger.error(`Failed to load event ${file}: ${error instanceof Error ? error.stack : error}`);
        }
      }
      // Register reaction role event handlers
      try {
        const reactionRoleAdd = (await import('./events/reactionRoleAdd')).default;
        if (this.isValidEvent(reactionRoleAdd)) {
          await this.client.loadEvent(reactionRoleAdd);
        }
        const reactionRoleRemove = (await import('./events/reactionRoleRemove')).default;
        if (this.isValidEvent(reactionRoleRemove)) {
          await this.client.loadEvent(reactionRoleRemove);
        }
      } catch (e) {
        Logger.warn('Could not load reaction role event handlers: ' + e);
      }

      Logger.success(`Loaded ${eventCount} events`);
    } catch (error) {
      Logger.error(`Failed to load events: ${error instanceof Error ? error.stack : error}`);
    }
  }
}