import fs from 'fs-extra';
export interface PresenceAction {
  message?: string;
  activity?: string;
}

export interface UserTrigger {
  autoReply?: string;
  reactEmoji?: string;
}

export interface AutomationConfig {
  dndMessage: string;
  dryTriggers: string[];
  dryEmoji: string;
  stealth: boolean;
  macros: Record<string, string>;
  userTriggers: Record<string, UserTrigger>;
  presenceActions: {
    online?: PresenceAction;
    idle?: PresenceAction;
    dnd?: PresenceAction;
    invisible?: PresenceAction;
  };
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
  automationConfig.dryEmoji = emoji;
  automationConfig.dryTriggers = triggers;
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
