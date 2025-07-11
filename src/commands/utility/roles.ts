import { Command, CommandExecuteOptions } from '../../types/command';
import { config } from '../../config';

// List of self-assignable role IDs (set in config or .env as comma-separated list)
const SELF_ASSIGNABLE_ROLES = (process.env.SELF_ASSIGNABLE_ROLES || '').split(',').map(r => r.trim()).filter(Boolean);

const roles: Command = {
  options: {
    name: 'roles',
    description: 'List, add, or remove self-assignable roles.',
    category: 'utility',
    usage: '/roles | /roles add <role> | /roles remove <role>',
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message || !message.guild || !message.member) return;
    if (!args || args.length === 0) {
      // List self-assignable roles
      if (SELF_ASSIGNABLE_ROLES.length === 0) {
        await message.reply('No self-assignable roles are configured.');
        return;
      }
      const roleNames = SELF_ASSIGNABLE_ROLES.map(id => {
        const role = message.guild!.roles.cache.get(id);
        return role ? role.name : `Unknown (${id})`;
      });
      await message.reply('Self-assignable roles: ' + roleNames.join(', '));
      return;
    }
    const sub = args[0].toLowerCase();
    const roleName = args.slice(1).join(' ');
    if (!roleName) {
      await message.reply('Please specify a role name.');
      return;
    }
    const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase() && SELF_ASSIGNABLE_ROLES.includes(r.id));
    if (!role) {
      await message.reply('That role is not self-assignable or does not exist.');
      return;
    }
    if (sub === 'add') {
      if (message.member.roles.cache.has(role.id)) {
        await message.reply('You already have that role.');
        return;
      }
      await message.member.roles.add(role);
      await message.reply(`You have been given the role: ${role.name}`);
    } else if (sub === 'remove') {
      if (!message.member.roles.cache.has(role.id)) {
        await message.reply('You do not have that role.');
        return;
      }
      await message.member.roles.remove(role);
      await message.reply(`The role ${role.name} has been removed from you.`);
    } else {
      await message.reply('Usage: !roles add <role> | !roles remove <role>');
    }
  }
};

export default roles; 