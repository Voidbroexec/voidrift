# VoidRift Bot Documentation

VoidRift is a modular Discord bot built with TypeScript and Discord.js v14. It provides advanced automation features and a flexible command system designed for power users.

## Features

- **Dynamic Command Loader** – Commands and events are automatically loaded from the `src/commands` and `src/events` folders.
- **Owner and Admin Permissions** – Command access is controlled via owner checks and permission flags.
- **Cooldown Management** – Prevents spam by limiting how frequently commands can be used.
- **Presence Automation** – React to status changes (Online, Idle, DND, Invisible) with custom messages or activities.
- **Smart DND Auto-Responder** – When the bot is set to Do Not Disturb, it automatically replies to DMs or mentions with a configurable message.
- **Dry Text Self-Reaction** – The bot reacts to its own short replies ("ok", "k", etc.) with a custom emoji.
- **Per‑User Triggers** – Configure automatic replies or reactions for specific users.
- **Stealth Mode** – Temporarily disable all automations without unloading commands.
- **Macro Commands** – Create quick text responses that run when no other command matches.
- **Presence History** – Record and display recent status changes.
- **Message Snipe** – Retrieve recently deleted messages in a channel.
- **Command Tray** – `/commandtray` lists owner/admin commands with descriptions.
- **Configuration Import/Export** – Save and restore automation settings to JSON files.

## Installation

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/yourusername/voidrift-bot.git
   cd voidrift-bot
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your bot token and owner ID.
3. Build the project:
   ```bash
   npm run build
   ```
4. Start the bot:
   ```bash
   npm start
   ```

## Important Commands

### Presence
- `setdnd <message>` – Set the automatic DND response text.
- `setreact <emoji> <word1> [word2...]` – Configure emoji reaction for short replies.
- `settrigger <status> <message|activity> <text>` – Define actions when the bot's status changes.
- `setusertrigger <@user> <reply|- > <emoji|->` – Set per-user auto-reply or reaction.
- `presencehistory` – Show recent status changes.

### System
- `stealth <on|off>` – Toggle stealth mode to suppress automations.
- `macro <add|remove|list> [name] [text]` – Manage quick macro responses.
- `commandtray` – Display owner or admin commands.
- `exportconfig [path]` – Export automation config to a file.
- `importconfig <path>` – Import automation config from a file.

### Utility
- `snipe` – Show the last deleted message in the current channel.

## Project Structure

```
voidrift-bot/
├── src/
│   ├── commands/      # Command files
│   ├── events/        # Event handlers
│   ├── utils/         # Helper modules
│   └── ...
└── docs/              # Documentation
```

## License

MIT
