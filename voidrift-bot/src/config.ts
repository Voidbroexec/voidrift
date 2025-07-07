import { BotConfig } from './types/command';
import dotenv from 'dotenv';

dotenv.config();

export const config: BotConfig = 
{
    token: process.env.DISCORD_TOKEN ?? '',
    ownerId: process.env.OWNER_ID ?? '',
    prefix: process.env.PREFIX ?? '!',
    embedColor: process.env.EMBED_COLOR ?? '#4B006E', 
    presence: 
    {
        status: 'online',
        activity: 
        {
            name: 'with commands | !help',
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

    if (!config.ownerId)
    {
        console.error('❌ OWNER_ID is required in .env file');
        return false;
    }

    return true;
};

export default config;
