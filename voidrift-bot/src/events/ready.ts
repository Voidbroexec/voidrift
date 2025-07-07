
import { Event } from '../types/command';
import { Logger } from '../utils/logger';
import { VoidriftClient } from '../client';

const ready: Event = 
{
  name: 'ready',
  once: true,
  execute: async (client: VoidriftClient) => 
  {
    Logger.success(`Bot is ready! Logged in as ${client.user?.tag}`);
    Logger.info(`Serving ${client.guilds.cache.size} guilds with ${client.commands.size} commands`);
    
    // Optional: Set up any periodic tasks here
    setInterval(() => 
    {
      // Example: Log bot stats every hour
      Logger.info(`Bot Stats - Guilds: ${client.guilds.cache.size}, Users: ${client.users.cache.size}`);
    }, 3600000); // 1 hour
  }
};

export default ready;