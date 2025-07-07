
# VoidRift Bot

A powerful, modular Discord bot built with TypeScript and Discord.js v14. Features dynamic command loading, proper permission handling, and a clean, extensible architecture.

## 🚀 Features

- **Dynamic Command Loading**: Add new commands by dropping files in the commands folder
- **Modular Architecture**: Organized by categories (utility, fun, presence, system)
- **Permission System**: Role-based and owner-only command restrictions
- **Cooldown System**: Prevent command spam with configurable cooldowns
- **Error Handling**: Comprehensive error handling and logging
- **TypeScript**: Full TypeScript support with proper type definitions
- **Hot Reload**: Reload commands without restarting the bot

## 📁 Project Structure

```md
voidrift-bot/
├── src/
│   ├── index.ts              # Entry point
│   ├── client.ts             # Discord client setup
│   ├── loader.ts             # Dynamic command/event loader
│   ├── config.ts             # Bot configuration
│   ├── commands/
│   │   ├── utility/          # Utility commands
│   │   │   ├── help.ts
│   │   │   ├── ping.ts
│   │   │   ├── userinfo.ts
│   │   │   ├── serverinfo.ts
│   │   │   └── avatar.ts
│   │   ├── fun/              # Fun commands
│   │   │   ├── poll.ts
│   │   │   └── 8ball.ts
│   │   ├── presence/         # Presence commands
│   │   │   └── status.ts
│   │   └── system/           # System commands
│   │       └── reload.ts
│   ├── events/
│   │   ├── ready.ts          # Bot ready event
│   │   └── message.ts        # Message handling
│   ├── utils/
│   │   ├── logger.ts         # Logging utility
│   │   └── permcheck.ts      # Permission checker
│   └── types/
│       └── command.ts        # Type definitions
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash

   git clone https://github.com/yourusername/voidrift-bot.git
   cd voidrift-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your bot token and owner ID
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the bot**
   ```bash
   npm start
   ```

## 🔧 Configuration

Create a `.env` file in the root directory with the following variables:

```env
DISCORD_TOKEN=your_bot_token_here
OWNER_ID=your_discord_user_id_here
PREFIX=!
EMBED_COLOR=#7289da
NODE_ENV=production
```

### Getting Your Bot Token

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section
4. Copy the bot token
5. Add the bot to your server with appropriate permissions

## 📝 Available Commands

### Utility Commands
- `!help [command]` - Display help information
- `!ping` - Check bot latency
- `!userinfo [@user]` - Get user information
- `!serverinfo` - Get server information
- `!avatar [@user]` - Display user avatar

### Fun Commands
- `!poll <question> | <option1> | <option2>` - Create a poll
- `!8ball <question>` - Ask the magic 8-ball

### Presence Commands (Owner Only)
- `!status <type> <text>` - Change bot status

### System Commands (Owner Only)
- `!reload [command]` - Reload commands

## 🔨 Adding New Commands

1. Create a new TypeScript file in the appropriate category folder
2. Use the command template:

```typescript
import { EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command';
import { config } from '../../config';

const mycommand: Command = {
  options: {
    name: 'mycommand',
    description: 'My awesome command',
    category: 'utility',
    aliases: ['mc'],
    usage: 'mycommand <argument>',
    examples: ['mycommand hello'],
    cooldown: 5
  },
  
  execute: async ({ client, message, args }) => {
    if (!message) return;
    
    // Your command logic here
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('My Command')
      .setDescription('Hello, World!')
      .set# voidrift
