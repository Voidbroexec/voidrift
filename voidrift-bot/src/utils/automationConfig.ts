import fs from 'fs-extra';
import fetch from 'node-fetch';

// send it to AI to explain bro sorry i just coded without thinking

export interface PresenceAction {
  message?: string;
  activity?: string;
}

export interface UserTrigger {
  autoReply?: string;
  reactEmoji?: string;
}

export interface AutoCommand {
  command: string;
  channelId: string;
  intervalMs: number;
  nextRun: number;
}

export interface AutomationConfig {
  dndMessage: string;
  dryTriggers: string[];
  dryEmoji: string;
  globalReactEmoji?: string;
  stealth: boolean;
  macros: Record<string, string>;
  userTriggers: Record<string, UserTrigger>;
  presenceActions: {
    online?: PresenceAction;
    idle?: PresenceAction;
    dnd?: PresenceAction;
    invisible?: PresenceAction;
  };
  autoCommands?: AutoCommand[];
}

export const automationConfig: AutomationConfig = {
  dndMessage: "Don't disturb please.",
  dryTriggers: ['ok', 'k', 'lol', 'nah'],
  dryEmoji: '😐',
  stealth: false,
  macros: {},
  userTriggers: {},
  presenceActions: {}
};

export function setDndMessage(message: string): void {
  automationConfig.dndMessage = message;
}

export function setStealth(on: boolean): void {
  automationConfig.stealth = on;
}

export function setDryReact(emoji: string, triggers: string[]): void {
  if (emoji.toLowerCase() === 'off') {
    automationConfig.globalReactEmoji = undefined;
    automationConfig.dryEmoji = '';
    automationConfig.dryTriggers = [];
  } else if (triggers.length === 0) {
    automationConfig.globalReactEmoji = emoji;
    automationConfig.dryEmoji = '';
    automationConfig.dryTriggers = [];
  } else {
    automationConfig.globalReactEmoji = undefined;
    automationConfig.dryEmoji = emoji;
    automationConfig.dryTriggers = triggers;
  }
}

export function setPresenceAction(status: keyof AutomationConfig['presenceActions'], action: PresenceAction): void {
  automationConfig.presenceActions[status] = {
    ...automationConfig.presenceActions[status],
    ...action
  };
}

export function setUserTrigger(userId: string, trigger: UserTrigger): void {
  if (!trigger.autoReply && !trigger.reactEmoji) {
    delete automationConfig.userTriggers[userId];
  } else {
    automationConfig.userTriggers[userId] = {
      ...automationConfig.userTriggers[userId],
      ...trigger
    };
  }
}

export async function exportAutomationConfig(path: string): Promise<void> {
  await fs.outputJson(path, automationConfig, { spaces: 2 });
}

export async function importAutomationConfig(path: string): Promise<void> {
  const data = await fs.readJson(path);
  Object.assign(automationConfig, data);
}

export function addMacro(name: string, text: string): void {
  automationConfig.macros[name.toLowerCase()] = text;
}

export function removeMacro(name: string): void {
  delete automationConfig.macros[name.toLowerCase()];
}

export function listMacros(): Record<string, string> {
  return { ...automationConfig.macros };
}

if (!automationConfig.autoCommands) automationConfig.autoCommands = [];

export function addAutoCommand(command: string, channelId: string, intervalMs: number): void {
  if (!automationConfig.autoCommands) automationConfig.autoCommands = [];
  automationConfig.autoCommands.push({
    command,
    channelId,
    intervalMs,
    nextRun: Date.now() + intervalMs
  });
}

export function removeAutoCommand(command: string, channelId: string): void {
  if (!automationConfig.autoCommands) return;
  automationConfig.autoCommands = automationConfig.autoCommands.filter(c => c.command !== command || c.channelId !== channelId);
}

export function listAutoCommands(): AutoCommand[] {
  return automationConfig.autoCommands ? [...automationConfig.autoCommands] : [];
}

// Fetch upcoming CTFs from CTFTime API
export async function fetchUpcomingCTFs(limit = 5) {
  // CTFTime API: https://ctftime.org/api/v1/events/?limit=5&start=now
  const now = Math.floor(Date.now() / 1000);
  const url = `https://ctftime.org/api/v1/events/?limit=${limit}&start=${now}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch CTFs');
    const data = (await res.json()) as any[];
    // Format CTFs for Discord
    return data.map((ctf: any) => ({
      title: ctf.title,
      url: ctf.url,
      start: new Date(ctf.start), // CTFTime returns ISO 8601 string
      finish: new Date(ctf.finish), // CTFTime returns ISO 8601 string
      format: ctf.format,
      onsite: ctf.onsite,
      location: ctf.location,
      duration: ctf.duration,
      description: ctf.description
    }));
  } catch (err) {
    return [];
  }
}
