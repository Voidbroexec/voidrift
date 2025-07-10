import { Event } from '../types/command';
import { reactionRoleMap } from '../commands/utility/reactionrole';
import { MessageReaction, User } from 'discord.js';

const reactionRoleAdd: Event = {
  name: 'messageReactionAdd',
  execute: async (_client, reaction: MessageReaction, user: User) => {
    if (user.bot) return;
    const entry = reactionRoleMap[reaction.message.id];
    if (!entry) return;
    if (reaction.emoji.name !== entry.emoji) return;
    const member = await reaction.message.guild?.members.fetch(user.id);
    if (member && !member.roles.cache.has(entry.roleId)) {
      await member.roles.add(entry.roleId);
    }
  }
};

export default reactionRoleAdd; 