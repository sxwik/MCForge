# 🚀 Quick Start Guide

## 1️⃣ Installation (2 minutes)

```bash
cd minecraft-bot
npm install
```

## 2️⃣ Configuration (1 minute)

Edit `src/config/default.json`:
- Change `server.host` to your Minecraft server
- Change `server.port` if needed (default: 25565)
- Change `server.username` to your bot's name

## 3️⃣ Start Bot (30 seconds)

```bash
npm start
```

You should see:
```
✅ Minecraft Bot Platform started successfully
🌐 Dashboard available at http://localhost:3000
```

## 4️⃣ Access Dashboard

Open in browser: **http://localhost:3000**

## 📋 Essential Commands

### Navigation
| Command | Result |
|---------|--------|
| `!goto 100 64 100` | Go to coordinates |
| `!follow PlayerName` | Follow a player |
| `!stop` | Stop movement |
| `!come` | Come to sender |

### Location Memory
| Command | Result |
|---------|--------|
| `!sethome` | Save current position as home |
| `!home` | Teleport to home |

### Survival
| Command | Result |
|---------|--------|
| `!survive on` | Enable auto-eat, sleep, etc |
| `!survive off` | Disable survival mode |

### Inventory
| Command | Result |
|---------|--------|
| `!inventory` | Show inventory |

### Mining
| Command | Result |
|---------|--------|
| `!mine diamond_ore` | Mine diamonds |

### Information
| Command | Result |
|---------|--------|
| `!help` | List all commands |
| `!ping` | Bot responds "Pong!" |
| `!status` | Show health, hunger, position |

## 🤖 AI Commands (Natural Language)

In the dashboard, use the "Natural Language" input:

```
gather 64 stone
mine diamond
go home
build house.schem
protect area
follow me
```

## 📊 Dashboard Features

1. **Bot Status**: Real-time health, hunger, coordinates
2. **Inventory**: Live item list
3. **Command Console**: Execute game commands
4. **Natural Language**: AI interpretation
5. **Chat Console**: Server chat
6. **Current Task**: What bot is doing
7. **Memory**: Saved locations
8. **Multi-Bot Control**: Manage multiple bots
9. **Live Logs**: System events

## 🐛 Troubleshooting

### Bot doesn't connect?
- ✅ Check server host/port in config
- ✅ Verify bot username
- ✅ Check server is running

### Commands not working?
- ✅ Use `!help` to verify command exists
- ✅ Check bot has spawned (look for "Bot spawned" in logs)
- ✅ Verify command syntax

### Dashboard won't load?
- ✅ Ensure port 3000 is free
- ✅ Check `npm install` completed
- ✅ Refresh browser

## 🎯 First Steps

1. Start the bot with `npm start`
2. Open dashboard at http://localhost:3000
3. Type `!help` in the game chat
4. Try `!status` to check bot is running
5. Try `!sethome` to save current position
6. Try `!goto 100 64 100` to test navigation
7. Try `!survive on` to enable survival mode

## 📁 File Structure Quick Reference

```
minecraft-bot/
├── src/bot.js              ← Main bot logic
├── src/config/default.json ← Server settings
├── data/memory.json        ← Saved locations
├── public/index.html       ← Dashboard UI
├── index.js                ← Start here
└── package.json            ← Dependencies
```

## ⚡ Advanced Tips

### Enable Only Needed Features
Edit `src/config/default.json`:
```json
"features": {
  "survival": true,
  "pathfinding": true,
  "logging": true,
  "dashboard": true
}
```

### Change Log Level
- `"debug"`: Verbose logging
- `"info"`: Important events only
- `"warn"`: Warnings and errors only
- `"error"`: Errors only

### Customize Dashboard Port
```json
"dashboard": {
  "port": 3000
}
```

### Set Admin Users
```json
"permissions": {
  "adminUsers": ["YourUsername", "Player2"]
}
```

## 🔗 Need Help?

- Check **README.md** for full documentation
- Look at **src/logs/** for error messages
- Verify configuration in **src/config/default.json**
- Check bot output in console

---

**You're all set! Happy botting! 🎮**
