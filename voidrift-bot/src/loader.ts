
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { VoidriftClient } from './client';
import { Command, Event } from './types/command';
import { Logger } from './utils/logger';

export class Loader 
{
  private readonly client: VoidriftClient;

  constructor(client: VoidriftClient) 
  {
    this.client = client;
  }

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
          file.endsWith('.js') ?? file.endsWith('.ts')
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
            Logger.error(`Failed to load command ${category}/${file}: ${error}`);
          }
        }
      }

      Logger.success(`Loaded ${commandCount} commands from ${categories.length} categories`);
    } catch (error) 
    {
      Logger.error(`Failed to load commands: ${error}`);
    }
  }

  public async loadEvents(): Promise<void> 
  {
    const eventsPath = join(__dirname, 'events');
    let eventCount = 0;

    try 
    {
      const eventFiles = readdirSync(eventsPath).filter(file => 
        file.endsWith('.js') ?? file.endsWith('.ts')
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
          Logger.error(`Failed to load event ${file}: ${error}`);
        }
      }

      Logger.success(`Loaded ${eventCount} events`);
    } catch (error) 
    {
      Logger.error(`Failed to load events: ${error}`);
    }
  }

  public async reloadCommand(commandName: string): Promise<boolean> 
  {
    try 
    {
      const command = this.client.commands.get(commandName);
      if (!command) return false;

      // Find the command file
      const commandsPath = join(__dirname, 'commands');
      const categories = readdirSync(commandsPath).filter(dir => 
        statSync(join(commandsPath, dir)).isDirectory()
      );

      for (const category of categories) 
      {
        const categoryPath = join(commandsPath, category);
        const commandFiles = readdirSync(categoryPath);
        
        for (const file of commandFiles) 
        {
          const commandPath = join(categoryPath, file);
          delete require.cache[require.resolve(commandPath)];
          
          const commandModule = await import(commandPath);
          const reloadedCommand: Command = commandModule.default ?? commandModule;
          
          if (reloadedCommand.options.name === commandName) 
          {
            // Remove old aliases
            if (command.options.aliases) 
            {
              command.options.aliases.forEach(alias => 
              {
                this.client.aliases.delete(alias);
              });
            }
            
            // Load new command
            await this.client.loadCommand(reloadedCommand);
            return true;
          }
        }
      }
      
      return false;
    } catch (error) 
    {
      Logger.error(`Failed to reload command ${commandName}: ${error}`);
      return false;
    }
  }

  private isValidCommand(command: any): command is Command 
  {
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

  private isValidEvent(event: any): event is Event 
  {
    return (
      event &&
      typeof event === 'object' &&
      typeof event.name === 'string' &&
      typeof event.execute === 'function'
    );
  }
}