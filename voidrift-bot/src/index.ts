
import { VoidriftClient } from './client';
import { Loader } from './loader';
import { validateConfig } from './config'; 
import { Logger } from './utils/logger';

// ASCII Art Banner
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
  // Display banner
  console.log(banner);
  
  // Validate configuration
  if (!validateConfig()) 
  {
    Logger.error('Configuration validation failed! Please check your .env file.');
    process.exit(1);
  }

  try 
  {
    // Initialize client
    const client = new VoidriftClient();
    const loader = new Loader(client);

    // Load commands and events
    Logger.info('Loading commands and events...');
    await loader.loadCommands();
    await loader.loadEvents();

    // Handle process termination
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

    // Start the bot
    await client.start();

  } catch (error) 
  {
    Logger.error(`Fatal error during startup: ${error}`);
    process.exit(1);
  }
}

// Start the application
main().catch(error => 
{
  Logger.error(`Failed to start application: ${error}`);
  process.exit(1);
});