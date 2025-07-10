import { EmbedBuilder,ColorResolvable  } from 'discord.js';
import { Command, CommandExecuteOptions } from '../../types/command';
import { config } from '../../config';

const help: Command = 
{
  options: 
  {
    name: 'help',
    description: 'Display bot commands and information',
    category: 'utility',
    usage: '/help [command]'
  },
  
  execute: async ({ client, message, args }: CommandExecuteOptions) => 
  {
    if (!message) return;

    const defaultColor = (config.embedColor as string) || '#2d0036';
    const embed = new EmbedBuilder()
      .setColor(defaultColor as any)
      .setAuthor({ 
        name: `${client.user?.username} Commands`,
        iconURL: client.user?.displayAvatarURL()
      })
      .setTimestamp()
      .setFooter({ text: `Requested by ${message.author.tag}` });

    // Show specific command help
    if (args && args.length > 0) 
    {
      const commandName = args[0].toLowerCase();
      const command = client.commands.get(commandName) ?? 
                     client.commands.get(client.aliases.get(commandName) ?? '');

      if (!command) 
      {
        embed.setDescription(`❌ Command \`${commandName}\` not found.`);
        await message.reply({ embeds: [embed] });
        return;
      }

      embed.setTitle(`Command: /${command.options.name}`)
        .setDescription(command.options.description)
        .addFields
        (
          { name: 'Category', value: command.options.category, inline: true },
          { name: 'Usage', value: `\`/${command.options.usage ?? command.options.name}\``, inline: true }
        );

      if (command.options.aliases && command.options.aliases.length > 0) 
      {
        embed.addFields({ name: 'Aliases', value: command.options.aliases?.map((a: string) => `/${a}`).join(', ') || 'None', inline: true });
      }

      if (command.options.examples && command.options.examples.length > 0) 
      {
        embed.addFields({ 
          name: 'Examples', 
          value: command.options.examples?.map((ex: string) => `/${ex}`).join('\n') || 'None' 
        });
      }

      if (command.options.permissions && command.options.permissions.length > 0) 
      {
        embed.addFields({ 
          name: 'Required Permissions', 
          value: command.options.permissions
          .map((p: any) => typeof p === 'string' ? p : p.name ?? JSON.stringify(p))
          .join(', ')

        });
      }

      await message.reply({ embeds: [embed] });
      return;
    }

    // Show all commands organized by category
    const categories = new Map<string, Command[]>();
    
    client.commands.forEach((cmd: any) =>
    {
      if (!categories.has(cmd.options.category)) {
        categories.set(cmd.options.category, []);
      }
      categories.get(cmd.options.category)!.push(cmd);
    });

    embed.setDescription('Use `/help [command]` for detailed information about a command.');

    categories.forEach((commands, category) => 
    {
      const commandList = commands
        .map(cmd => `/${cmd.options.name}`)
        .join(', ');
      
      embed.addFields({ 
        name: `${category.charAt(0).toUpperCase() + category.slice(1)} (${commands.length})`,
        value: commandList,
        inline: false
      });
    });

    embed.addFields(
    { 
      name: 'Bot Information',
      value: `• Total Commands: ${client.commands.size}\n• Use the Discord slash command menu (type /)`
    });

    await message.reply({ embeds: [embed] });
  }
};

export default help;