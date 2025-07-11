import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { config } from 'dotenv';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

config();

const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const TOKEN = process.env.DISCORD_TOKEN;

if (!CLIENT_ID || !GUILD_ID || !TOKEN) {
  console.error('Missing CLIENT_ID, GUILD_ID, or DISCORD_TOKEN in environment variables.');
  process.exit(1);
}

// Helper to recursively get all command files
function getCommandFiles(dir: string): string[] {
  let results: string[] = [];
  const list = readdirSync(dir);
  list.forEach(file => {
    const filePath = join(dir, file);
    if (statSync(filePath).isDirectory()) {
      results = results.concat(getCommandFiles(filePath));
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      results.push(filePath);
    }
  });
  return results;
}

const commands: any[] = [];
const commandFiles = getCommandFiles(join(__dirname, 'commands'));

for (const file of commandFiles) {
  const commandModule = require(file);
  const command = commandModule.default || commandModule;
  if (
    command &&
    command.options &&
    command.options.slashCommand &&
    command.options.name &&
    command.options.description
  ) {
    if (command.options.slashData instanceof SlashCommandBuilder) {
      commands.push(command.options.slashData.toJSON());
    } else {
      commands.push(
        new SlashCommandBuilder()
          .setName(command.options.name)
          .setDescription(command.options.description)
          .toJSON()
      );
    }
  }
}

// Print all command names to help debug duplicates
console.log('Registering the following command names:');
console.log(commands.map(cmd => cmd.name));

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})(); 