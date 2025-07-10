import { Event } from '../types/command';
import { reactionRoleMap } from '../commands/utility/reactionrole';
import { MessageReaction, User } from 'discord.js';

const reactionRoleRemove: Event = {
  name: 'messageReactionRemove',
  execute: async (_client, reaction: MessageReaction, user: User) => {
    if (user.bot) return;
    const entry = reactionRoleMap[reaction.message.id];
    if (!entry) return;
    if (reaction.emoji.name !== entry.emoji) return;
    const member = await reaction.message.guild?.members.fetch(user.id);
    if (member && member.roles.cache.has(entry.roleId)) {
      await member.roles.remove(entry.roleId);
    }
  }
};

export default reactionRoleRemove; 