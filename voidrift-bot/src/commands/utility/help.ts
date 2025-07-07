
import { EmbedBuilder,ColorResolvable  } from 'discord.js';
import { Command } from '../../types/command';
import { config } from '../../config';

const help: Command = 
{
  options: 
  {
    name: 'help',
    description: 'Display bot commands and information',
    category: 'utility',
    aliases: ['h', 'commands'],
    usage: 'help [command]',
    examples: ['help', 'help ping']
  },
  
  execute: async ({ client, message, args }) => 
  {
    if (!message) return;

    const embed = new EmbedBuilder()
      .setColor(config.embedColor as ColorResolvable)
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

      embed.setTitle(`Command: ${command.options.name}`)
        .setDescription(command.options.description)
        .addFields
        (
          { name: 'Category', value: command.options.category, inline: true },
          { name: 'Usage', value: `\`${config.prefix}${command.options.usage ?? command.options.name}\``, inline: true }
        );

      if (command.options.aliases && command.options.aliases.length > 0) 
      {
        embed.addFields({ name: 'Aliases', value: command.options.aliases.map(a => `\`${a}\``).join(', '), inline: true });
      }

      if (command.options.examples && command.options.examples.length > 0) 
      {
        embed.addFields({ 
          name: 'Examples', 
          value: command.options.examples.map(ex => `\`${config.prefix}${ex}\``).join('\n') 
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
    
    client.commands.forEach(cmd =>
    {
      if (!categories.has(cmd.options.category)) {
        categories.set(cmd.options.category, []);
      }
      categories.get(cmd.options.category)!.push(cmd);
    });

    embed.setDescription(`Use \`${config.prefix}help [command]\` for detailed information about a command.`);

    categories.forEach((commands, category) => 
    {
      const commandList = commands
        .map(cmd => `\`${cmd.options.name}\``)
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
      value: `• Total Commands: ${client.commands.size}\n• Prefix: \`${config.prefix}\`\n• Guilds: ${client.guilds.cache.size}`
    });

    await message.reply({ embeds: [embed] });
  }
};

export default help;