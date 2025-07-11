# VoidRift v2 

> This is the next major version. For the original release, see branch/tag `v1`.

A powerful, modular Discord bot built with TypeScript and Discord.js v14, specifically designed for dev,cybersecurity and IT communities. Features dynamic command loading, advanced security tools, comprehensive moderation features, and a clean, extensible architecture.

## 🚀 Features

- **97 Total Commands**: Comprehensive command suite for all needs
- **Cybersecurity Focus**: Security analysis, threat detection, and IT tools
- **Dynamic Command Loading**: Add new commands by dropping files in the commands folder
- **Modular Architecture**: Organized by categories (utility, fun, moderation, system, community, presence)
- **Advanced Security**: User analysis, permission checking, and threat detection
- **Comprehensive Moderation**: Full moderation suite with audit logging
- **Permission System**: Role-based and owner-only command restrictions
- **Cooldown System**: Prevent command spam with configurable cooldowns
- **Error Handling**: Comprehensive error handling and logging
- **TypeScript**: Full TypeScript support with proper type definitions
- **Hot Reload**: Reload commands without restarting the bot

## ☕ Support the Project

If you find this bot helpful and want to support its development, consider buying me a coffee! ☕

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/voidlegend)

**Your support helps me:**
- 🚀 Add new features and commands
- 🐛 Fix bugs and improve performance  
- 🔒 Enhance security features
- 📚 Create better documentation
- ☕ Keep the caffeine flowing for late-night coding sessions

*Every coffee helps keep this project alive and growing!*

## 📁 Project Structure

```md
voidrift-bot/
├── src/
│   ├── index.ts              # Entry point
│   ├── client.ts             # Discord client setup
│   ├── loader.ts             # Dynamic command/event loader
│   ├── config.ts             # Bot configuration
│   ├── commands/
│   │   ├── utility/          # Utility commands (30+ commands)
│   │   │   ├── help.ts
│   │   │   ├── ping.ts
│   │   │   ├── userinfo.ts
│   │   │   ├── serverinfo.ts
│   │   │   ├── avatar.ts
│   │   │   ├── banner.ts     # NEW: User banner display
│   │   │   ├── servericon.ts # NEW: Server icon display
│   │   │   ├── roleinfo.ts   # NEW: Role information
│   │   │   ├── channelinfo.ts # NEW: Channel information
│   │   │   ├── emojilist.ts  # NEW: Emoji listing
│   │   │   ├── pingrole.ts   # NEW: Role pinging
│   │   │   ├── hash.ts       # NEW: Hash generation
│   │   │   ├── base64.ts     # NEW: Base64 encoding/decoding
│   │   │   └── passwordgen.ts # NEW: Password generation
│   │   ├── fun/              # Fun commands (20+ commands)
│   │   │   ├── poll.ts
│   │   │   ├── 8ball.ts
│   │   │   ├── roll.ts       # NEW: Dice rolling
│   │   │   ├── choose.ts     # NEW: Random choice
│   │   │   ├── quoteadd.ts   # NEW: Add quotes
│   │   │   └── quoteget.ts   # NEW: Get quotes
│   │   ├── moderation/       # Moderation commands (10+ commands)
│   │   │   ├── ban.ts
│   │   │   ├── kick.ts
│   │   │   ├── mute.ts
│   │   │   ├── purgeuser.ts  # NEW: User message purge
│   │   │   ├── lockdown.ts   # NEW: Emergency lockdown
│   │   │   └── modlog.ts     # NEW: Moderation logs
│   │   ├── community/        # Community features
│   │   │   ├── xp.ts
│   │   │   ├── level.ts
│   │   │   └── leaderboard.ts
│   │   ├── presence/         # Presence commands
│   │   │   └── status.ts
│   │   └── system/           # System commands
│   │       ├── reload.ts
│   │       └── whois.ts      # ENHANCED: Advanced user analysis
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
   git clone https://github.com/Voidbroexec/voidrift.git
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
ADMIN_IDS=comma,separated,admin,ids
ADMIN_ROLE=admin-role-id
PREFIX=!
EMBED_COLOR=#7289da
NODE_ENV=production
WELCOME_CHANNEL_ID=channel-id
GOODBYE_CHANNEL_ID=channel-id
AUTO_ROLE_ID=role-id
INTRO_CHANNEL_ID=channel-id
RULES_CHANNEL_ID=channel-id
LOG_CHANNEL_ID=channel-id
TICKET_PANEL_CHANNEL=channel-id
SELF_ASSIGNABLE_ROLES=role1,role2,role3
SPAM_THRESHOLD=5
SPAM_INTERVAL=7000
SPAM_TIMEOUT=60
INFINITE_MONEY_USER_ID=your-discord-user-id

# Optional API keys for enhanced media search
UNSPLASH_ACCESS_KEY=your-unsplash-key
YOUTUBE_API_KEY=your-youtube-key
VIMEO_ACCESS_TOKEN=your-vimeo-token
PEXELS_API_KEY=your-pexels-key
HUGGINGFACE_TOKEN=your-huggingface-token
```

- `INFINITE_MONEY_USER_ID`: (Optional) Discord user ID that always has infinite money in economy commands.
- All other API keys are optional and only needed for enhanced results in the `/void` command (images, gifs, videos, AI, etc).

**Supported APIs for /void command:**
- DuckDuckGo (text, image, video search)
- Wikipedia (text summaries)
- dictionaryapi.dev (definitions)
- Tenor (GIFs)
- Meme API (memes)
- Unsplash (images, if key)
- Pexels (images, if key)
- YouTube (videos, if key)

### Getting Your Bot Token

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section
4. Copy the bot token
5. Add the bot to your server with appropriate permissions

## 📝 Available Commands (97 Total)

### 🔍 Enhanced System Commands
- **`/whois [@user]`** - **ENHANCED**: Advanced user analysis with security flags, badges, moderation history, and threat detection
  - Shows user badges, account age, security analysis
  - Detects suspicious usernames and new accounts
  - Analyzes permissions and security risks
  - Perfect for cybersecurity communities

### 🛠️ Utility Commands (30+ commands)
- **`/help [command]`** - Display help information
- **`/ping`** - Check bot latency
- **`/userinfo [@user]`** - Get user information
- **`/serverinfo`** - Get server information
- **`/avatar [@user]`** - Display user avatar
- **`/banner [@user]`** - **NEW**: Display user banner with details
- **`/servericon`** - **NEW**: Show server icon with statistics
- **`/roleinfo [@role]`** - **NEW**: Detailed role information with security analysis
- **`/channelinfo [#channel]`** - **NEW**: Channel information with permissions
- **`/emojilist`** - **NEW**: List all custom emojis in server
- **`/pingrole [@role] [message]`** - **NEW**: Ping roles with permission checks
- **`/hash [algorithm] [text]`** - **NEW**: Hash strings (MD5, SHA1, SHA256)
- **`/base64 [encode/decode] [text]`** - **NEW**: Base64 encoding/decoding
- **`/passwordgen [length] [strength]`** - **NEW**: Generate strong passwords
- **`/quest`** - View system quests and user-created bounties
- **`/quest make <amount> <info>`** - Create a user bounty (escrowed VCoins)
- **`/quest list`** - List open bounties
- **`/quest claim <questId>`** - Claim a bounty
- **`/quest complete <questId> <@solver>`** - Complete and pay out a bounty

### 🎮 Fun Commands (20+ commands)
- **`/poll <question> | <option1> | <option2>`** - Create a poll
- **`/8ball <question>`** - Ask the magic 8-ball
- **`/roll [XdY]`** - **NEW**: Advanced dice rolling with D&D support
- **`/choose [option1] [option2] ...`** - **NEW**: Random choice selector
- **`/quoteadd [quote] [author]`** - **NEW**: Add quotes to community collection
- **`/quoteget [author]`** - **NEW**: Get random quotes from collection

### 🛡️ Moderation Commands (10+ commands)
- **`/ban [@user] [reason]`** - Ban a user
- **`/kick [@user] [reason]`** - Kick a user
- **`/mute [@user] [duration] [reason]`** - Mute a user
- **`/warn [@user] [reason]`** - Warn a user
- **`/purge [amount]`** - Delete messages
- **`/purgeuser [@user] [amount]`** - **NEW**: Purge messages from specific user
- **`/lockdown [reason]`** - **NEW**: Emergency server lockdown
- **`/modlog [@user] [amount]`** - **NEW**: Display moderation action history

### 🏆 Community Commands
- **`/xp [@user]`** - Check XP and level
- **`/level [@user]`** - Show level information
- **`/leaderboard`** - Show XP leaderboard
- **`/birthday`** - Birthday management
- **`/suggest [suggestion]`** - Make suggestions

### 💰 Economy Commands
- **`/balance [@user]`** - Check balance
- **`/daily`** - Collect daily reward
- **`/pay [@user] [amount]`** - Pay another user
- **`/gamble [amount]`** - Gamble VCoins
- **`/lottery`** - Participate in lottery
- **`/shop`** - View shop items

### 🎭 Presence Commands (Owner Only)
- **`/status <type> <text>`** - Change bot status

### ⚙️ System Commands (Owner Only)
- **`/reload [command]`** - Reload commands

## 🔐 Cybersecurity Features

### Advanced User Analysis (`/whois`)
- **Security Flags**: Detects suspicious usernames, new accounts, and weak patterns
- **Badge Display**: Shows all Discord badges and achievements
- **Permission Analysis**: Identifies high-privilege users
- **Account Age**: Calculates account age and flags new accounts
- **Threat Detection**: Warns about potentially dangerous users

### Security Tools
- **`/hash`**: Generate cryptographic hashes with security warnings
- **`/base64`**: Encode/decode with content filtering
- **`/passwordgen`**: Generate strong passwords with strength analysis
- **`/roleinfo`**: Analyze role permissions and security implications
- **`/channelinfo`**: Review channel permissions and settings

### Emergency Response
- **`/lockdown`**: Emergency server lockdown with notifications
- **`/purgeuser`**: Rapid user message removal
- **`/modlog`**: Comprehensive audit trail

## 🏆 User Bounties (Quests)

- Users can create bounties for help, code review, or any dev/cyber task using VCoins as a reward.
- Bounties are created with `/quest make <amount> <info>` and are held in escrow until completed.
- Anyone can claim a bounty with `/quest claim <questId>`, and the creator can pay out with `/quest complete <questId> <@solver>`.
- Use `/quest list` to see all open bounties.

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
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();
    
    await message.reply({ embeds: [embed] });
  }
};

export default mycommand;
```

## 🚀 Recent Updates

### Version 2.0 - Cybersecurity Enhancement
- **Enhanced `/whois`**: Advanced user analysis with security flags
- **16 New Commands**: Comprehensive utility, fun, and moderation tools
- **Security Focus**: All commands include cybersecurity considerations
- **Emergency Tools**: Lockdown and rapid response capabilities
- **Community Features**: Quote system and enhanced social features

### New Command Categories
- **Utility**: Banner, server icon, role info, channel info, emoji list, ping role, hash, base64, password generation
- **Fun**: Dice rolling, random choice, quote management
- **Moderation**: User purge, emergency lockdown, moderation logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add proper TypeScript types
5. Test thoroughly
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please open an issue on GitHub or join our Discord server.

---

**Built with ❤️ for the cybersecurity and dev community**
*join our discord: ``https://discord.gg/uH537ebQ``*
