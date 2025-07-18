import { Message, PermissionResolvable, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { config } from '../config';
import { Command } from '../types/command';

export class PermissionChecker {
  static isAdmin(userId: string, member?: GuildMember): boolean {
    if (config.adminIds.includes(userId)) return true;
    if (config.adminRole && member) {
      return member.roles.cache.has(config.adminRole);
    }
    return false;
  }

  static async checkPermissions(
    command: Command,
    message?: Message,
    interaction?: ChatInputCommandInteraction
  ): Promise<{ hasPermission: boolean; missingPermissions?: string[] }> {
    const user = message?.author || interaction?.user;
    const member = message?.member || interaction?.member as GuildMember;
    
    if (!user) {
      return { hasPermission: false };
    }

    // Admin bypass: admins can use ALL commands
    if (this.isAdmin(user.id, member)) {
      return { hasPermission: true };
    }

    // Check if command is owner only
    if (command.options.ownerOnly) {
      return { hasPermission: false, missingPermissions: ['Bot Admin'] };
    }

    // Check if command requires guild
    if (command.options.guildOnly && !member) {
      return { hasPermission: false, missingPermissions: ['Must be used in a server'] };
    }

    // Check Discord permissions
    if (command.options.permissions && member) {
      const missingPermissions: string[] = [];
      
      for (const permission of command.options.permissions) {
        if (!member.permissions.has(permission)) {
          missingPermissions.push(this.formatPermission(permission));
        }
      }
      
      if (missingPermissions.length > 0) {
        return { hasPermission: false, missingPermissions };
      }
    }

    return { hasPermission: true };
  }

  private static formatPermission(permission: PermissionResolvable): string {
    if (typeof permission === 'string') {
      return permission.replace(/([A-Z])/g, ' $1').trim();
    }
    return permission.toString();
  }
}