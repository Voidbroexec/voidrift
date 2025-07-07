import { Presence } from 'discord.js';
import { Event } from '../types/command';
import { VoidriftClient } from '../client';
import { automationConfig, PresenceAction } from '../utils/automationConfig';
import { logPresence } from '../utils/presenceHistory';
import { config } from '../config';

const presenceWatcher: Event = {
  name: 'presenceUpdate',
  execute: async (client: VoidriftClient, _old: Presence | null, newPresence: Presence) => {
    if (!client.user) return;
    if (newPresence.userId !== client.user.id) return;
    logPresence(newPresence.status);
    if (automationConfig.stealth) return;
    const status = newPresence.status as keyof typeof automationConfig.presenceActions;
    const action: PresenceAction | undefined = automationConfig.presenceActions[status];
    if (!action) return;

    if (action.activity) {
      try {
        await client.user.setActivity(action.activity);
      } catch {
        // ignore
      }
    }

    if (action.message) {
      try {
        const owner = await client.users.fetch(config.ownerId);
        await owner.send(action.message);
      } catch {
        // ignore
      }
    }
  }
};

export default presenceWatcher;
