# VoidRift Bot - Quick Reference Guide

## 🆕 Version 2.0 New Commands

### 🔍 Enhanced `/whois` Command
```bash
/whois @username
```
**New Features:**
- Security flags and threat detection
- Badge display and account analysis
- Permission analysis and risk assessment
- Account age calculation
- Cybersecurity-focused user profiling

---

### 🛠️ New Utility Commands

#### Display Commands
```bash
/banner @username          # Show user banner
/servericon               # Show server icon
/emojilist               # List all custom emojis
```

#### Information Commands
```bash
/roleinfo @role          # Detailed role information
/channelinfo #channel    # Channel information
/pingrole @role message  # Ping role with checks
```

#### Security Tools
```bash
/hash md5 text           # Generate MD5 hash
/hash sha256 text        # Generate SHA256 hash
/base64 encode text      # Encode to base64
/base64 decode aGVsbG8=  # Decode from base64
/passwordgen 16 strong   # Generate strong password
```

---

### 🎮 New Fun Commands

#### Gaming
```bash
/roll 1d20              # Roll 1 twenty-sided die
/roll 2d6               # Roll 2 six-sided dice
/roll 3d10              # Roll 3 ten-sided dice
/choose pizza burger    # Random choice
/choose "pizza" "burger" # With quoted options
```

#### Quote System
```bash
/quoteadd "Security is not a product" Bruce Schneier
/quoteget              # Get random quote
/quoteget Bruce        # Get quote by author
```

---

### 🛡️ New Moderation Commands

#### Advanced Moderation
```bash
/purgeuser @user 50     # Purge user messages
/lockdown Security incident  # Emergency lockdown
/modlog @user 10        # Show user mod actions
/modlog 20              # Show recent mod actions
```

---

## 🔐 Cybersecurity Features

### Security Analysis (`/whois`)
- **Suspicious Usernames**: Detects patterns like "discord", "nitro", "gift"
- **New Accounts**: Flags accounts less than 7 days old
- **Weak Usernames**: Identifies numeric or very short usernames
- **High Permissions**: Warns about users with administrative privileges
- **Badge Display**: Shows all Discord badges and achievements

### Security Tools
- **`/hash`**: Generate cryptographic hashes with security warnings
  - MD5: ⚠️ Deprecated (not cryptographically secure)
  - SHA1: ⚠️ Weak (vulnerable to collision attacks)
  - SHA256: ✅ Secure (currently cryptographically secure)

- **`/base64`**: Encode/decode with content filtering
  - Filters sensitive keywords (password, secret, key, token, api, private)
  - Warns about suspicious decoded content (URLs, Discord links)

- **`/passwordgen`**: Generate strong passwords
  - Simple: Letters and numbers only
  - Strong: Letters, numbers, and common symbols
  - Very Strong: Full character set with special symbols
  - Strength scoring and entropy calculation

### Emergency Response
- **`/lockdown`**: Emergency server lockdown
  - Locks all text channels
  - Sends emergency notifications
  - Requires administrator permission
  - Content filtering for test lockdowns

- **`/purgeuser`**: Rapid user message removal
  - Permission validation
  - Bulk deletion with confirmation
  - Statistics and audit trail

- **`/modlog`**: Comprehensive audit trail
  - Shows recent moderation actions
  - Filter by user or action type
  - Action statistics and analysis

---

## 🎯 Usage Examples

### For Cybersecurity Communities

#### User Analysis
```bash
# Analyze new member
/whois @newuser

# Check role permissions
/roleinfo @Moderator

# Review channel settings
/channelinfo #general
```

#### Security Demonstrations
```bash
# Show hash differences
/hash md5 password123
/hash sha256 password123

# Generate strong password
/passwordgen 20 very-strong

# Encode sensitive data
/base64 encode "sensitive information"
```

#### Emergency Response
```bash
# Emergency lockdown
/lockdown Security incident detected

# Purge malicious user
/purgeuser @malicious 100

# Review moderation actions
/modlog @user 50
```

### For General Use

#### Community Engagement
```bash
# Add community wisdom
/quoteadd "The best defense is a good offense" Sun Tzu

# Get random inspiration
/quoteget

# Make decisions
/choose "Option A" "Option B" "Option C"
```

#### Fun Activities
```bash
# D&D style rolling
/roll 1d20

# Multiple dice
/roll 3d6

# Random choices
/choose pizza burger sushi
```

#### Server Management
```bash
# Show server branding
/servericon

# List custom emojis
/emojilist

# Ping role safely
/pingrole @Announcements Important update
```

---

## ⚠️ Security Warnings

### Content Filtering
- **Sensitive Keywords**: Commands filter words like "password", "secret", "key", "token", "api", "private"
- **Suspicious Patterns**: Detects URLs, Discord invites, mentions in decoded content
- **Test Lockdowns**: Warns about lockdown reasons containing "test", "joke", "fun", "lol", "haha"

### Permission Requirements
- **`/purgeuser`**: Requires "Manage Messages" permission
- **`/lockdown`**: Requires Administrator permission
- **`/modlog`**: Requires "View Audit Log" permission
- **`/pingrole`**: Requires "Mention Everyone" permission

### Algorithm Security
- **MD5**: ⚠️ Deprecated - Not cryptographically secure
- **SHA1**: ⚠️ Weak - Vulnerable to collision attacks
- **SHA256**: ✅ Secure - Currently cryptographically secure

---

## 📊 Quick Statistics

| Feature | Count | Description |
|---------|-------|-------------|
| **Total Commands** | 97 | Complete command suite |
| **New Commands** | 16 | Added in Version 2.0 |
| **Enhanced Commands** | 1 | `/whois` complete overhaul |
| **Security Tools** | 5 | Hash, base64, password, role, channel |
| **Emergency Tools** | 3 | Lockdown, purgeuser, modlog |
| **Fun Features** | 4 | Roll, choose, quoteadd, quoteget |

---

## 🚀 Getting Started

1. **Start with `/help`** to explore all available commands
2. **Use `/whois @user`** to analyze new members
3. **Try `/passwordgen 16 strong`** for security demonstrations
4. **Use `/roll 1d20`** for fun decision-making
5. **Add quotes with `/quoteadd`** to build community wisdom

---

**For complete documentation, see [COMMANDS.md](./COMMANDS.md)** 