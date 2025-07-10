// Configuration for the VoidRift bot.
// This file loads environment variables and provides config values for the bot.
// If you want to change bot settings, edit your .env file or this config!

import { BotConfig } from './types/command';
import dotenv from 'dotenv';

dotenv.config();

function isValidHexColor(str: string | undefined): boolean {
  return !!str && /^#?[0-9A-Fa-f]{6}$/.test(str);
}

export const config: BotConfig = 
{
    token: process.env.DISCORD_TOKEN ?? '',
    adminIds: (process.env.ADMIN_IDS ?? '').split(',').map(id => id.trim()).filter(Boolean),
    adminRole: process.env.ADMIN_ROLE ?? '',
    prefix: '/', // No longer used, but kept for compatibility
    embedColor: isValidHexColor(process.env.EMBED_COLOR) ? process.env.EMBED_COLOR! : '#7289da',
    presence: 
    {
        status: 'online',
        activity: 
        {
            name: 'with commands | /help',
            type: 2 // LISTENING
        }
    }
};

export const validateConfig = (): boolean => 
    {
    if (!config.token)
    {
        console.error('❌ DISCORD_TOKEN is required in .env file');
        return false;
    }

    if (!config.adminIds.length && !config.adminRole)
    {
        console.error('❌ ADMIN_IDS or ADMIN_ROLE is required in .env file');
        return false;
    }

    return true;
};

export default config;
