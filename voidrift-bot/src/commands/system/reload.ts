import { EmbedBuilder,ColorResolvable  } from 'discord.js';
import { Command } from '../../types/command';
import { config } from '../../config';
import { Loader } from '../../loader';

const reload: Command = 
{
  options: 
  {
    name: 'reload',
    description: 'Reload a specific command or all commands',
    category: 'system',
    aliases: ['rl'],
    usage: 'reload [command]',
    examples: ['reload', 'reload help'],
    ownerOnly: true
  },
  
  execute: async ({ client, message, args }) => 
 {
    if (!message) return;

    const loader = new Loader(client);

    const defaultColor = (config.embedColor as string) || '#2d0036';
    if (args && args.length > 0) 
    {
      // Reload specific command
      const commandName = args[0].toLowerCase();
      const command = client.commands.get(commandName) ?? 
                     client.commands.get(client.aliases.get(commandName) ?? '');

      if (!command) 
      {
        await message.reply('❌ Command not found!');
        return;
      }

      // Reload all commands (since reloadCommand does not exist)
      await loader.loadCommands();
      const embed = new EmbedBuilder()
        .setColor(defaultColor as any)
        .setTitle('✅ Commands Reloaded')
        .setDescription('All commands have been reloaded.')
        .setTimestamp();
      await message.reply({ embeds: [embed] });
      return;
    } else 
    {
      // Reload all commands
      const embed = new EmbedBuilder()
        .setColor(defaultColor as any)
        .setTitle('🔄 Reloading Commands...')
        .setDescription('Please wait while all commands are reloaded.')
        .setTimestamp();

      const reloadMessage = await message.reply({ embeds: [embed] });

      try 
      {
        // Clear collections
        client.commands.clear();
        client.aliases.clear();

        // Reload all commands
        await loader.loadCommands();

        embed.setTitle('✅ All Commands Reloaded')
          .setDescription(`Successfully reloaded **${client.commands.size}** commands`)
          .setColor('#00ff00');

        await reloadMessage.edit({ embeds: [embed] });
      } catch (error) {
        embed.setTitle('❌ Reload Failed')
          .setDescription(`Failed to reload commands: ${error}`)
          .setColor('#ff0000');

        await reloadMessage.edit({ embeds: [embed] });
      }
    }
  }
};

export default reload;