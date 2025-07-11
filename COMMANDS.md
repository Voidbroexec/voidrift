# VoidRift Bot - Complete Command List

## 📊 Overview
**Total Commands: 97** | **Categories: 6** | **Last Updated: Version 2.0**

---

## 🔍 Enhanced System Commands

### `/whois [@user]`
**Category:** System  
**Description:** Advanced user analysis with security flags, badges, and threat detection  
**Usage:** `/whois @username`  
**Features:**
- User badges and achievements display
- Security analysis (suspicious usernames, new accounts)
- Permission analysis and risk assessment
- Account age calculation
- Cybersecurity threat detection
- 2FA status (when available)
- Role and permission breakdown

---

## 🛠️ Utility Commands (30+ commands)

### Core Utility
- **`/help [command]`** - Display help information and command list
- **`/ping`** - Check bot latency and response time
- **`/userinfo [@user]`** - Get detailed user information
- **`/serverinfo`** - Display comprehensive server statistics
- **`/avatar [@user]`** - Show user avatar with download links

### NEW: Display Commands
- **`/banner [@user]`** - Display user banner with high-quality image
- **`/servericon`** - Show server icon with multiple size options
- **`/emojilist`** - List all custom emojis with statistics

### NEW: Information Commands
- **`/roleinfo [@role]`** - Detailed role information with security analysis
- **`/channelinfo [#channel]`** - Channel information with permission details
- **`/pingrole [@role] [message]`** - Ping roles with permission checks

### NEW: Security Tools
- **`/hash [algorithm] [text]`** - Generate cryptographic hashes (MD5, SHA1, SHA256)
- **`/base64 [encode/decode] [text]`** - Base64 encoding/decoding with content filtering
- **`/passwordgen [length] [strength]`** - Generate strong passwords with security analysis

### Economy & Trading
- **`/balance [@user]`** - Check VCoin balance
- **`/bank`** - Bank account management
- **`/pay [@user] [amount]`** - Transfer VCoins to another user
- **`/gift [@user] [amount]`** - Gift VCoins to another user
- **`/daily`** - Collect daily reward
- **`/mint [amount]`** - Mint new VCoins (admin only)
- **`/tax [percentage]`** - Set tax rate (admin only)

### Trading System
- **`/trade [@user] [amount] [item]`** - Create a trade offer
- **`/accepttrade [tradeId]`** - Accept a trade offer
- **`/declinetrade [tradeId]`** - Decline a trade offer
- **`/confirmedpay [@user] [amount]`** - Confirmed payment system

### Gambling & Games
- **`/gamble [amount]`** - Gamble VCoins
- **`/bet [amount] [choice]`** - Place a bet
- **`/coinflip [amount]`** - Flip a coin for VCoins
- **`/slots [amount]`** - Play slot machine
- **`/lottery`** - Participate in lottery
- **`/shop`** - View and purchase items

### Quest System
- **`/quest`** - View available quests
- **`/quest make [amount] [info]`** - Create a bounty quest
- **`/quest list`** - List all open quests
- **`/quest claim [questId]`** - Claim a quest
- **`/quest complete [questId] [@solver]`** - Complete and pay out quest

### Communication
- **`/invite`** - Get bot invite link
- **`/translate [text]`** - Translate text
- **`/define [word]`** - Get word definitions
- **`/weather [location]`** - Get weather information
- **`/remindme [time] [message]`** - Set a reminder
- **`/afk [reason]`** - Set AFK status

### Server Management
- **`/roles`** - Manage self-assignable roles
- **`/reactionrole [message] [emoji] [role]`** - Set up reaction roles
- **`/ticket`** - Create support tickets
- **`/poll [question] | [options]`** - Create polls
- **`/giveaway [prize] [winners] [time]`** - Start a giveaway
- **`/snipe`** - Show last deleted message
- **`/uptime`** - Check bot uptime

---

## 🎮 Fun Commands (20+ commands)

### Classic Fun
- **`/8ball [question]`** - Ask the magic 8-ball
- **`/meme`** - Get random memes
- **`/gif [query]`** - Search for GIFs
- **`/cat`** - Get random cat images
- **`/dog`** - Get random dog images
- **`/quote`** - Get random quotes

### NEW: Gaming Commands
- **`/roll [XdY]`** - Advanced dice rolling with D&D support
  - Supports any dice notation (1d6, 2d20, 3d10, etc.)
  - Shows roll quality and statistics
  - Special messages for critical rolls
- **`/choose [option1] [option2] ...`** - Random choice selector
  - Supports quoted strings for multi-word options
  - Shows all options and selection statistics

### NEW: Quote System
- **`/quoteadd [quote] [author]`** - Add quotes to community collection
  - Supports quoted strings for long quotes
  - Duplicate detection
  - Content filtering for inappropriate content
- **`/quoteget [author]`** - Get random quotes from collection
  - Filter by author
  - Shows quote statistics
  - Special highlighting for famous authors

### Interactive Fun
- **`/rps [choice]`** - Rock, Paper, Scissors
- **`/roast [@user]`** - Roast another user
- **`/ai [prompt]`** - AI-powered responses
- **`/void [query]`** - Multi-source search and AI
- **`/spam [text] [amount]`** - Spam text (with limits)
- **`/troll [@user]`** - Troll another user
- **`/autorofl`** - Auto-ROFL system

---

## 🛡️ Moderation Commands (10+ commands)

### Basic Moderation
- **`/ban [@user] [reason]`** - Ban a user from the server
- **`/kick [@user] [reason]`** - Kick a user from the server
- **`/mute [@user] [duration] [reason]`** - Mute a user temporarily
- **`/unmute [@user]`** - Unmute a user
- **`/warn [@user] [reason]`** - Warn a user
- **`/purge [amount]`** - Delete multiple messages

### NEW: Advanced Moderation
- **`/purgeuser [@user] [amount]`** - Purge messages from specific user
  - Permission checks and validation
  - Bulk deletion with confirmation
  - Statistics and audit trail
- **`/lockdown [reason]`** - Emergency server lockdown
  - Locks all text channels
  - Sends emergency notifications
  - Requires administrator permission
  - Content filtering for test lockdowns
- **`/modlog [@user] [amount]`** - Display moderation action history
  - Shows recent moderation actions
  - Filter by user or action type
  - Comprehensive audit trail
  - Action statistics

### Channel Management
- **`/lock`** - Lock a channel
- **`/unlock`** - Unlock a channel
- **`/slowmode [seconds]`** - Set channel slowmode

---

## 🏆 Community Commands

### XP & Leveling
- **`/xp [@user]`** - Check XP and level
- **`/level [@user]`** - Show detailed level information
- **`/leaderboard`** - Show XP leaderboard
- **`/setxp [@user] [amount]`** - Set user XP (admin only)

### Community Features
- **`/birthday`** - Birthday management system
- **`/suggest [suggestion]`** - Make server suggestions
- **`/serverstats`** - Show server statistics

---

## 💰 Economy Commands

### Core Economy
- **`/balance [@user]`** - Check VCoin balance
- **`/bank`** - Bank account management
- **`/pay [@user] [amount]`** - Transfer VCoins
- **`/gift [@user] [amount]`** - Gift VCoins
- **`/daily`** - Collect daily reward

### Gambling & Games
- **`/gamble [amount]`** - Gamble VCoins
- **`/bet [amount] [choice]`** - Place bets
- **`/coinflip [amount]`** - Coin flip gambling
- **`/slots [amount]`** - Slot machine game
- **`/lottery`** - Lottery participation

### Trading & Commerce
- **`/trade [@user] [amount] [item]`** - Create trades
- **`/shop`** - View shop items
- **`/quest`** - Quest and bounty system

---

## 🎭 Presence Commands (Owner Only)

- **`/status [type] [text]`** - Change bot status
- **`/setdnd`** - Set bot to Do Not Disturb
- **`/setreact [emoji]`** - Set bot reaction
- **`/settrigger [word]`** - Set trigger words
- **`/setusertrigger [@user] [word]`** - Set user-specific triggers
- **`/presencehistory`** - View presence history

---

## ⚙️ System Commands (Owner Only)

- **`/reload [command]`** - Reload commands without restart
- **`/debug`** - Debug information
- **`/log [level] [message]`** - Log messages
- **`/stealth`** - Toggle stealth mode
- **`/commandtray`** - Command tray management
- **`/exportconfig`** - Export bot configuration
- **`/importconfig`** - Import bot configuration
- **`/voidrift`** - Bot information and statistics

---

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

---

## 📊 Command Statistics

| Category | Count | Description |
|----------|-------|-------------|
| **Utility** | 30+ | Core functionality and tools |
| **Fun** | 20+ | Entertainment and games |
| **Moderation** | 10+ | Server management and security |
| **Community** | 5+ | Social features and engagement |
| **Economy** | 15+ | Virtual currency and trading |
| **System** | 8+ | Bot administration |
| **Presence** | 6+ | Bot status and reactions |

**Total: 97 Commands**

---

## 🚀 Recent Updates (Version 2.0)

### Enhanced Features
- **Advanced `/whois`**: Complete user analysis with security focus
- **16 New Commands**: Comprehensive utility, fun, and moderation tools
- **Security Integration**: All commands include cybersecurity considerations
- **Emergency Tools**: Lockdown and rapid response capabilities
- **Community Features**: Quote system and enhanced social features

### New Command Categories
- **Utility**: Banner, server icon, role info, channel info, emoji list, ping role, hash, base64, password generation
- **Fun**: Dice rolling, random choice, quote management
- **Moderation**: User purge, emergency lockdown, moderation logs

---

## 🎯 Usage Tips

### For Cybersecurity Communities
1. Use `/whois` to analyze new members
2. Set up `/modlog` for comprehensive audit trails
3. Use `/lockdown` for emergency situations
4. Leverage `/hash` and `/passwordgen` for security demonstrations
5. Use `/roleinfo` and `/channelinfo` for permission audits

### For General Use
1. Start with `/help` to explore available commands
2. Use `/quest` system for community engagement
3. Leverage `/quoteadd` and `/quoteget` for community wisdom
4. Use `/roll` and `/choose` for fun decision-making
5. Explore `/void` for AI-powered assistance

---

**Built with ❤️ for the cybersecurity community** 