
import { VoidriftClient } from './client';
import { Loader } from './loader';
import { validateConfig } from './config'; 
import { Logger } from './utils/logger';

// Entry point for the VoidRift Discord bot.
// This file initializes the bot, loads commands/events, and starts the client.
// If you want to change how the bot boots up, start here!

// Import the ASCII banner and dependencies
const banner = `
╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║  ██╗   ██╗ ██████╗ ██╗██████╗ ██████╗ ██╗███████╗████████╗    ██████╗  ██████╗ ║
║  ██║   ██║██╔═══██╗██║██╔══██╗██╔══██╗██║██╔════╝╚══██╔══╝    ██╔══██╗██╔═══██╗║
║  ██║   ██║██║   ██║██║██║  ██║██████╔╝██║█████╗     ██║       ██████╔╝██║   ██║║
║  ╚██╗ ██╔╝██║   ██║██║██║  ██║██╔══██╗██║██╔══╝     ██║       ██╔══██╗██║   ██║║
║   ╚████╔╝ ╚██████╔╝██║██████╔╝██║  ██║██║██║        ██║       ██████╔╝╚██████╔╝║
║    ╚═══╝   ╚═════╝ ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝        ╚═╝       ╚═════╝  ╚═════╝ ║
║                                                                                ║
║                        Advanced Discord Bot Framework                          ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝
`;

async function main() 
{
  // Display banner in the console and logs
  console.log(banner);
  Logger.banner(banner);
  
  // Validate configuration before starting
  if (!validateConfig()) 
  {
    Logger.error('Configuration validation failed! Please check your .env file.');
    process.exit(1);
  }

  try 
  {
    // Initialize the Discord client and loader
    const client = new VoidriftClient();
    const loader = new Loader(client);

    // Load all commands and events dynamically
    Logger.info('Loading commands and events...');
    await loader.loadCommands();
    await loader.loadEvents();

    // Handle process termination and errors gracefully
    process.on('SIGINT', async () => 
    {
      Logger.info('Received SIGINT, shutting down gracefully...');
      await client.destroy();
      process.exit(0);
    });

    process.on('SIGTERM', async () => 
    {
      Logger.info('Received SIGTERM, shutting down gracefully...');
      await client.destroy();
      process.exit(0);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => 
    {
      Logger.error(`Uncaught Exception: ${error.message}`);
      Logger.error(error.stack ?? '');
    });

    process.on('unhandledRejection', (reason, promise) => 
    {
     Logger.error(
      `Unhandled Rejection at: ${JSON.stringify(promise)}, reason: ${reason}`
    );
    });

    // Start the bot (login to Discord)
    await client.start();

  } catch (error) 
  {
    Logger.error(`Fatal error during startup: ${error}`);
    process.exit(1);
  }
}

// Start the bot
main().catch(error => 
{
  Logger.error(`Failed to start application: ${error}`);
  process.exit(1);
});