# 🤖 Minecraft Bot - Production-Grade Automation Platform

A complete, autonomous Minecraft bot system with browser-based dashboard control, multi-bot support, and AI command interpretation.

## ✨ Features

### Core Systems
- ✅ Auto-reconnect with configurable retry attempts
- ✅ Comprehensive logging system with file rotation
- ✅ Permission management for multi-user environments
- ✅ Command handler with extensible architecture
- ✅ Error handling and graceful recovery
- ✅ Settings persistence

### Movement & Navigation
- ✅ A* pathfinding with mineflayer-pathfinder
- ✅ Follow player functionality
- ✅ Go to coordinates (!goto x y z)
- ✅ Come command (!come)
- ✅ Stop movement (!stop)
- ✅ Wander mode for exploration
- ✅ Anti-stuck detection
- ✅ Path recalculation on obstacles

### Survival AI
- ✅ Auto-eat when hungry
- ✅ Auto-sleep at night
- ✅ Auto-equip armor
- ✅ Auto-health management
- ✅ Lava avoidance
- ✅ Creeper detection
- ✅ Auto-respawn
- ✅ Toggleable survival mode

### Inventory Management
- ✅ Inventory viewer with live updates
- ✅ Item counting
- ✅ Deposit/withdraw items
- ✅ Auto-sort functionality
- ✅ Auto-equip tools
- ✅ Hotbar management

### Mining System
- ✅ Mine specific ore types
- ✅ Ore prioritization system
- ✅ Tool auto-selection
- ✅ Strip mining mode
- ✅ Quarry mode
- ✅ Y-level optimization

### Building System
- ✅ Single block placement
- ✅ Wall building
- ✅ House construction
- ✅ Structure templates
- ✅ Build progress tracking
- ✅ Schematic support (foundation)

### Combat AI
- ✅ Attack hostile mobs
- ✅ Shield usage
- ✅ Bow usage with angle calculation
- ✅ Retreat when low health
- ✅ Mob detection
- ✅ Guard mode for area protection

### Task Queue System
- ✅ Sequential task execution
- ✅ Priority-based queuing
- ✅ Pause/resume/cancel tasks
- ✅ Task status tracking
- ✅ Error handling per task

### Memory System
- ✅ Save home locations
- ✅ Save storage locations
- ✅ Mine cataloging
- ✅ Waypoint system
- ✅ Death location tracking
- ✅ Persistent JSON storage
- ✅ Auto-save functionality

### AI Command Interpreter
- ✅ Natural language processing
- ✅ Command parsing patterns
- ✅ Task auto-generation
- ✅ Examples:
  - "Gather 64 stone"
  - "Mine diamond"
  - "Go to my base"
  - "Build house.schem"
  - "Protect area"
  - "Follow player"

### Multi-Bot System
- ✅ Multiple bot management
- ✅ BuilderBot (construction)
- ✅ MinerBot (resource gathering)
- ✅ FarmerBot (harvesting)
- ✅ GuardBot (protection)
- ✅ Bot coordination
- ✅ Capability-based task assignment
- ✅ System status monitoring

### Browser Dashboard
- ✅ Real-time bot status (health, hunger, position)
- ✅ Live inventory viewer
- ✅ Command console
- ✅ Chat console
- ✅ Task status display
- ✅ Saved locations management
- ✅ Multi-bot control panel
- ✅ Live logs
- ✅ Socket.io live updates
- ✅ Responsive design

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- npm
- Minecraft server (Java Edition)

### Installation

```bash
# Clone or extract the project
cd minecraft-bot

# Install dependencies
npm install

# Copy environment example
cp .env.example .env

# Edit configuration
nano src/config/default.json
```

### Configure Server

Edit `src/config/default.json`:

```json
{
  "server": {
    "host": "your-server.com",
    "port": 25565,
    "username": "YourBotName",
    "auth": "offline"
  },
  "dashboard": {
    "port": 3000
  }
}
```

### Run

```bash
npm start
```

The bot will:
1. Connect to your Minecraft server
2. Start the dashboard on http://localhost:3000
3. Initialize all systems
4. Begin accepting commands

## 📊 Dashboard Access

Open your browser and navigate to:
```
http://localhost:3000
```

### Features Available:
- **Bot Status**: Real-time health, hunger, coordinates
- **Inventory**: Live item tracking
- **Commands**: Execute game commands
- **AI Commands**: Natural language task execution
- **Chat**: Send messages to the server
- **Memory**: Manage saved locations
- **Multi-Bot**: Control multiple bots

## 🎮 Commands

### Navigation
```
!goto <x> <y> <z>      # Go to coordinates
!follow <player>       # Follow a player
!come                  # Come to caller
!stop                  # Stop movement
!wander                # Wander mode
```

### Location Memory
```
!sethome               # Set home location
!home                  # Go to home
!setmine <name>        # Save mine location
!storage <name>        # Save storage
```

### Survival
```
!survive on            # Enable survival mode
!survive off           # Disable survival mode
```

### Inventory
```
!inventory             # Show inventory
!deposit <item>        # Deposit item
!withdraw <item>       # Withdraw item
```

### Mining
```
!mine <ore>            # Mine specific ore
!stripmine             # Strip mining mode
```

### Information
```
!help                  # Show commands
!ping                  # Ping bot
!status                # Bot status
```

### AI Commands
```
!ai gather 64 stone         # Mine 64 stone
!ai mine diamond            # Find and mine diamonds
!ai go to my base           # Navigate to home
!ai build house.schem       # Build structure
!ai protect area            # Guard current area
```

## 📁 Project Structure

```
minecraft-bot/
├── src/
│   ├── bot.js                    # Main bot system
│   ├── config/
│   │   └── default.json          # Configuration
│   ├── commands/
│   │   └── commandHandler.js     # Command processing
│   ├── dashboard/
│   │   └── dashboardServer.js    # Express server
│   ├── memory/
│   │   └── memoryManager.js      # Location storage
│   ├── movement/
│   │   └── movement.js           # Pathfinding
│   ├── survival/
│   │   └── survivalAI.js         # Auto-eat, sleep, etc
│   ├── inventory/
│   │   └── inventoryManager.js   # Item management
│   ├── mining/
│   │   └── miningSystem.js       # Mining logic
│   ├── building/
│   │   └── buildingSystem.js     # Building system
│   ├── combat/
│   │   └── combatAI.js           # Combat logic
│   ├── ai/
│   │   └── aiInterpreter.js      # NLP commands
│   ├── tasks/
│   │   └── taskQueue.js          # Task scheduling
│   ├── multiBot/
│   │   └── multiBotManager.js    # Multi-bot control
│   └── utils/
│       ├── logger.js             # Logging
│       ├── configLoader.js       # Config management
│       ├── permissionManager.js  # Permissions
│       └── eventEmitter.js       # Event system
├── public/
│   ├── index.html                # Dashboard UI
│   ├── css/
│   │   └── style.css             # Styling
│   └── js/
│       └── dashboard.js          # Dashboard logic
├── index.js                      # Entry point
├── package.json                  # Dependencies
└── README.md                     # This file
```

## 🔧 Configuration

### Default Config (`src/config/default.json`)

```json
{
  "server": {
    "host": "Bottest-d7bF.aternos.me",
    "port": 28572,
    "username": "TickelBot",
    "auth": "offline",
    "version": "1.20"
  },
  "bot": {
    "autoReconnect": true,
    "reconnectDelay": 5000,
    "maxReconnectAttempts": 10,
    "pathfindingTimeout": 30000,
    "movementSpeed": 1.0
  },
  "features": {
    "survival": true,
    "pathfinding": true,
    "logging": true,
    "dashboard": true,
    "memory": true
  },
  "survival": {
    "autoEat": true,
    "autoSleep": true,
    "autoEquipArmor": true,
    "hungerThreshold": 10,
    "healthThreshold": 10,
    "sleepAtNight": true
  },
  "dashboard": {
    "port": 3000,
    "host": "0.0.0.0",
    "updateInterval": 500
  },
  "logging": {
    "level": "debug",
    "maxFileSize": "10m",
    "maxFiles": 5
  },
  "memory": {
    "persistPath": "./data/memory.json",
    "autoSave": true,
    "saveInterval": 30000
  }
}
```

## 📝 Logging

Logs are stored in `src/logs/` with automatic rotation:
- Format: `bot-YYYY-MM-DD.log`
- Configurable size limits and retention
- Includes ERROR, WARN, INFO, DEBUG levels

## 🔐 Permissions

Permission levels:
- **User** (0): Basic commands
- **Moderator** (1): Advanced operations
- **Admin** (2): System commands

Set in config:
```json
"permissions": {
  "defaultLevel": "user",
  "adminUsers": ["YourUsername"],
  "commands": {
    "admin": 2,
    "moderator": 1,
    "user": 0
  }
}
```

## 🤝 Multi-Bot System

Create multiple bot instances:

```javascript
const platform = new MinecraftBotPlatform();

// Create multiple bots
botManager.createBot('Builder1', 'builder');
botManager.createBot('Miner1', 'miner');
botManager.createBot('Farmer1', 'farmer');
botManager.createBot('Guard1', 'guard');

// Coordinate tasks
botManager.coordinateBots({
  requiredCapabilities: ['build', 'place'],
  schematic: 'house.schem'
});
```

## 🚨 Troubleshooting

### Bot won't connect
- Check server host/port in config
- Ensure username doesn't conflict
- Verify authentication type

### Dashboard not loading
- Check if port 3000 is available
- Verify `npm install` completed
- Check browser console for errors

### Commands not working
- Ensure bot has spawned (check logs)
- Verify command syntax
- Check permissions level

### Low performance
- Reduce `updateInterval` in dashboard config
- Enable fewer features
- Check available server resources

## 📦 Dependencies

- **mineflayer** (4.37.1): Minecraft bot framework
- **mineflayer-pathfinder** (2.4.5): Pathfinding plugin
- **minecraft-data** (2.122.0): Game data
- **express** (4.18.2): Web server
- **socket.io** (4.5.4): Real-time updates

## 🤖 Architecture

The system uses a modular design with:
- **Event-driven** architecture for responsiveness
- **Task queue** for sequential operations
- **Memory management** for state persistence
- **Permission-based** command execution
- **Multi-bot** coordination layer

## 🛠️ Development

### Adding Custom Commands

```javascript
commandHandler.register('mycommand', {
  description: 'My custom command',
  handler: ({ bot, args, username }) => {
    // Your logic here
  }
});
```

### Adding Task Handlers

```javascript
taskQueue.registerHandler('mytask', async (task, bot) => {
  // Execute task
});
```

### Adding AI Patterns

```javascript
// In AIInterpreter.initializePatterns()
mycommand: {
  pattern: /my\s+pattern/i,
  handler: this.parseMyCommand.bind(this)
}
```

## 📄 License

ISC

## 🙏 Acknowledgments

- Mineflayer team for the amazing bot framework
- Prismarine community for minecraft-data
- All contributors

## 🔗 Useful Links

- [Mineflayer GitHub](https://github.com/PrismarineJS/mineflayer)
- [Minecraft Protocol](https://wiki.vg/)
- [Prismarine](https://github.com/PrismarineJS)

---

**Status**: Production-Ready
**Version**: 2.0.0
**Last Updated**: 2026
