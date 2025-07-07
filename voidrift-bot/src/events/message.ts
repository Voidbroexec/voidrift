
import { Message, EmbedBuilder } from 'discord.js';
import { Event } from '../types/command';
import { VoidriftClient } from '../client';
import { config } from '../config';
import { Logger } from '../utils/logger';
import { PermissionChecker } from '../utils/permcheck';
import { automationConfig } from '../utils/automationConfig';

const message: Event = 
{
  name: 'messageCreate',
  execute: async (client: VoidriftClient, message: Message) => 
  {
    // Ignore bots and system messages
    if (message.author.bot || message.system) return;

    // Check if message starts with prefix
    if (!message.content.startsWith(config.prefix)) return;

    // Parse command and arguments
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    // Find command (check both commands and aliases)
    const command = client.commands.get(commandName) ??
                   client.commands.get(client.aliases.get(commandName) ?? '');

    if (!command) {
      const macro = automationConfig.macros[commandName];
      if (macro) {
        await message.reply(macro);
      }
      return;
    }

    try 
    {
      // Check permissions
      const permissionCheck = await PermissionChecker.checkPermissions(command, message);
      
      if (!permissionCheck.hasPermission) 
        {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Insufficient Permissions')
          .setDescription(`You don't have permission to use this command.`)
          .setTimestamp();

        if (permissionCheck.missingPermissions) 
        {
          embed.addFields(
          {
            name: 'Missing Permissions',
            value: permissionCheck.missingPermissions.join(', ')
          });
        }

        await message.reply({ embeds: [embed] });
        return;
      }

      // Check cooldown
      if (command.options.cooldown) 
      {
        const canUse = await client.checkCooldown
        (
          message.author.id,
          command.options.name,
          command.options.cooldown
        );

        if (!canUse) 
        {
          const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('⏰ Cooldown Active')
            .setDescription(`Please wait ${command.options.cooldown} seconds before using this command again.`)
            .setTimestamp();

          await message.reply({ embeds: [embed] });
          return;
        }
      }

      // Log command usage
      Logger.command
      (
        message.author.tag,
        command.options.name,
        message.guild?.name
      );

      // Execute command
      await command.execute(
      {
        client,
        message,
        args
      });

    } catch (error) 
    {
      Logger.error(`Error executing command ${command.options.name}: ${error}`);
      
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Command Error')
        .setDescription('An error occurred while executing this command.')
        .setTimestamp();

      try 
      {
        await message.reply({ embeds: [embed] });
      } catch (replyError) 
      {
        Logger.error(`Failed to send error message: ${replyError}`);
      }
    }
  }
};

export default message;