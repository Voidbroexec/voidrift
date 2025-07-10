import { Command } from '../../types/command';
import { config } from '../../config';
import { AttachmentBuilder, EmbedBuilder } from 'discord.js';

const voidrift: Command = {
  options: {
    name: 'voidrift',
    description: 'Show info about the bot and list all available commands.',
    category: 'system',
    usage: '/voidrift [category]',
    examples: ['/voidrift', '/voidrift fun', '/voidrift utility']
  },
  execute: async ({ message, args, client }) => {
    if (!message) return;

    // If a category is provided, show commands in that category
    if (args && args[0] && args[0] !== '-explain') {
      const categoryArg = args[0].toLowerCase();
      const cmds = (Array.from(client.commands.values()) as Command[]).filter(cmd => 
        (cmd.options.category || '').toLowerCase() === categoryArg
      );
      
      if (cmds.length === 0) {
        await message.reply(`❌ Unknown category: \`${args[0]}\`\n\nAvailable categories: \`fun\`, \`utility\`, \`moderation\`, \`community\`, \`presence\`, \`system\``);
        return;
      }

      let output = `=== ${categoryArg.charAt(0).toUpperCase() + categoryArg.slice(1)} Commands ===\n\n`;
      for (const cmd of cmds) {
        output += `**/${cmd.options.name}**`;
        if (cmd.options.usage) output += ` — ${cmd.options.usage}`;
        if (cmd.options.description) output += `\n    ${cmd.options.description}`;
        if (cmd.options.aliases && cmd.options.aliases.length > 0) {
          output += `\n    Aliases: ${cmd.options.aliases.map(a => `/${a}`).join(', ')}`;
        }
        output += '\n\n';
      }

      if (output.length > 1900) {
        const file = new AttachmentBuilder(Buffer.from(output, 'utf8'), { name: `${categoryArg}-commands.txt` });
        await message.reply({ 
          content: `📋 **${categoryArg.charAt(0).toUpperCase() + categoryArg.slice(1)} Commands** (${cmds.length} total)\nFull command reference attached:`, 
          files: [file] 
        });
      } else {
        await message.reply({ 
          content: `📋 **${categoryArg.charAt(0).toUpperCase() + categoryArg.slice(1)} Commands** (${cmds.length} total)\n\`\`\`${output}\`\`\`` 
        });
      }
      return;
    }

    // Show all commands organized by category
    const categories = new Map<string, Command[]>();
    
    (Array.from(client.commands.values()) as Command[]).forEach(cmd => {
      const category = cmd.options.category || 'uncategorized';
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(cmd);
    });

    const defaultColor = (config.embedColor as string) || '#2d0036';
    const embed = new EmbedBuilder()
      .setColor(defaultColor as any)
      .setTitle('🤖 VoidRift Bot Commands')
      .setDescription(`**${client.commands.size}** total commands across **${categories.size}** categories\n\nUse \`/voidrift [category]\` to see detailed commands for a specific category.`)
      .setTimestamp()
      .setFooter({ text: `Requested by ${message.author.tag}` });

    // Add each category as a field
    categories.forEach((commands, category) => {
      const commandList = commands
        .map(cmd => `\`/${cmd.options.name}\``)
        .join(', ');
      
      embed.addFields({ 
        name: `${category.charAt(0).toUpperCase() + category.slice(1)} (${commands.length})`,
        value: commandList.length > 1024 ? commandList.substring(0, 1021) + '...' : commandList,
        inline: false
      });
    });

    // Add bot info
    embed.addFields({
      name: '📊 Bot Information',
      value: `• **Total Commands:** ${client.commands.size}\n• **Categories:** ${categories.size}\n• **Guilds:** ${client.guilds.cache.size}\n• **Uptime:** <t:${Math.floor(client.uptime! / 1000)}:R>`,
      inline: false
    });

    await message.reply({ embeds: [embed] });
  }
};

export default voidrift; 