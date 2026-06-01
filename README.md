# McForge - Production-Grade Automation Platform

A fully autonomous Minecraft bot system with a browser-based dashboard, multi-bot support, and natural language command interpretation. Think of it as your personal Minecraft workforce—whether you need someone to gather resources, build structures, or defend your base, this bot's got you covered.

## What's Included

This project provides a complete automation solution for Minecraft Java servers. You get a responsive web dashboard for real-time control, intelligent movement and pathfinding, survival features that keep your bot alive, and a sophisticated task queuing system that handles complex operations.

The bot understands natural language commands too. Tell it to "gather 64 stone" or "mine diamonds" and it figures out what to do. For power users, there's a traditional command system with granular permission management.

## Key Features

**Movement & Exploration**  
The bot navigates using A* pathfinding and can follow players, travel to coordinates, or wander around exploring. It detects when it's stuck and recalculates paths automatically.

**Survival Intelligence**  
It eats when hungry, sleeps at night, equips armor, avoids lava and creepers, and respawns if needed. All of this runs in the background so you don't have to babysit it.

**Mining & Resource Gathering**  
Mine specific ores with intelligent tool selection, run strip mining operations, or use quarry mode to systematically clear areas. The bot learns which ores are most valuable and prioritizes accordingly.

**Building System**  
Place individual blocks, build walls, construct entire structures, and even load schematics. It tracks progress and recovers gracefully from interruptions.

**Combat Ready**  
Attack hostile mobs, use shields, fire bows with proper angle calculation, and retreat when health is low. There's also a guard mode if you want the bot to protect an area.

**Smart Inventory Management**  
Live inventory viewing, item sorting, automatic tool equipping, and the ability to deposit or withdraw specific items.

**Memory & Waypoints**  
Save home locations, storage points, mines, and waypoints. The bot remembers where it died and learns your base layout over time.

**Multi-Bot Coordination**  
Run multiple specialized bots simultaneously—builders, miners, farmers, guards. The system automatically assigns tasks based on each bot's capabilities.

## Getting Started

### What You Need

- Node.js 14 or higher
- npm
- A Minecraft Java Edition server

### Installation

```bash
# Get the code
cd mcforge

# Install dependencies
npm install

# Set up your config
cp .env.example .env
nano src/config/default.json
```

### Configuration

Edit `src/config/default.json` with your server details:

```json
{
  "server": {
    "host": "your-server.com",
    "port": 25565,
    "username": "YourBotName",
    "auth": "offline",
    "version": "1.20"
  },
  "dashboard": {
    "port": 3000
  },
  "survival": {
    "autoEat": true,
    "autoSleep": true,
    "autoEquipArmor": true
  }
}
```

### Launch

```bash
npm start
```

The bot connects to your server and launches the dashboard at `http://localhost:3000`. From there, you can see real-time status, inventory, and send commands.

## Using the Dashboard

> ⚠️ **Note**: The GUI dashboard is currently under development. Core functionality is working, but features and UI may change.

Open your browser to `http://localhost:3000` and you'll see:

- **Live Status**: Health, hunger, position, and whether the bot is moving
- **Inventory Viewer**: What the bot is carrying, updated in real-time
- **Command Console**: Execute commands directly
- **Chat**: Send messages to the server
- **Saved Locations**: Manage home, storage, and mine locations
- **Task Monitor**: Watch what the bot is working on
- **Multi-Bot Panel**: Control multiple bots from one place

## Commands

### Navigation
```
!goto <x> <y> <z>      Go to specific coordinates
!follow <player>       Follow another player
!come                  Come to whoever sent the command
!stop                  Stop moving immediately
!wander                Explore the area
```

### Locations
```
!sethome               Save current location as home
!home                  Return to saved home
!setmine <name>        Save a mine location
!storage <name>        Save storage location
```

### Inventory & Resources
```
!inventory             See what you're carrying
!deposit <item>        Store an item
!withdraw <item>       Grab an item from storage
!mine <ore>            Mine a specific ore type
!stripmine             Run strip mining mode
```

### Survival & Status
```
!survive on            Enable automatic survival features
!survive off           Disable survival features
!status                Check bot health and position
!ping                  Quick response check
```

### AI Commands (Natural Language)
```
!ai gather 64 stone         Mine 64 blocks of stone
!ai mine diamond            Find and extract diamonds
!ai go to my base           Navigate to saved home
!ai build house.schem       Construct a structure
!ai protect area            Guard the current area
```

## Project Structure

```
mcforge/
├── src/
│   ├── bot.js                    Main bot logic
│   ├── config/default.json       Configuration file
│   ├── commands/                 Command handlers
│   ├── dashboard/                Web server and UI
│   ├── memory/                   Location storage
│   ├── movement/                 Pathfinding and navigation
│   ├── survival/                 Auto-eat, sleep, armor
│   ├── inventory/                Item management
│   ├── mining/                   Mining operations
│   ├── building/                 Construction system
│   ├── combat/                   Combat and mob handling
│   ├── ai/                       Natural language processing
│   ├── tasks/                    Task queue system
│   ├── multiBot/                 Multi-bot coordination
│   └── utils/                    Logging, permissions, config
├── public/
│   ├── index.html                Dashboard interface
│   ├── css/style.css             Styling
│   └── js/dashboard.js           Frontend logic
├── index.js                      Entry point
└── package.json
```

## Advanced Configuration

The full configuration supports quite a bit of customization:

```json
{
  "bot": {
    "autoReconnect": true,
    "reconnectDelay": 5000,
    "maxReconnectAttempts": 10,
    "pathfindingTimeout": 30000,
    "movementSpeed": 1.0
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

Logs are automatically rotated and stored in `src/logs/` with timestamps.

## Permissions

Set permission levels for different users:

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

Permission levels:
- **User** (0): Basic navigation and information commands
- **Moderator** (1): Advanced operations and item management
- **Admin** (2): System commands and bot control

## Running Multiple Bots

Create a specialized bot fleet:

```javascript
const platform = new MinecraftBotPlatform();

botManager.createBot('BuilderBot', 'builder');
botManager.createBot('MinerBot', 'miner');
botManager.createBot('FarmerBot', 'farmer');
botManager.createBot('GuardBot', 'guard');

// The system automatically coordinates based on task requirements
botManager.coordinateBots({
  requiredCapabilities: ['build', 'place'],
  schematic: 'house.schem'
});
```

## Troubleshooting

**Bot won't connect to the server**  
Double-check your host and port in the config. Make sure the username doesn't conflict with existing players. Verify you're using the right authentication type.

**Dashboard isn't loading**  
Confirm port 3000 isn't already in use. Run `npm install` again to ensure all dependencies are there. Check your browser's developer console for errors.

**Commands aren't working**  
Make sure the bot has finished spawning (check the logs). Verify the command syntax matches. Check if your permission level allows the command.

**Performance issues**  
Try increasing the `updateInterval` in the dashboard config. Disable features you don't need. Make sure your machine has enough resources for the pathfinding calculations.

## Dependencies

- **mineflayer** - The core Minecraft bot framework
- **mineflayer-pathfinder** - A* pathfinding for navigation
- **minecraft-data** - Game data and protocol info
- **express** - Web server for the dashboard
- **socket.io** - Real-time updates between bot and dashboard

## Architecture

The system is built on modular, event-driven principles. Commands flow through handlers, tasks queue sequentially, and all state persists to disk. The multi-bot layer sits on top and coordinates work across multiple instances.

## Extending the Bot

**Add a Custom Command**

```javascript
commandHandler.register('mycommand', {
  description: 'What my command does',
  handler: ({ bot, args, username }) => {
    bot.chat(`Hello ${username}!`);
  }
});
```

**Add a Task Type**

```javascript
taskQueue.registerHandler('mytask', async (task, bot) => {
  // Do something with the bot
});
```

**Add an AI Pattern**

```javascript
// In AIInterpreter.initializePatterns()
mycommand: {
  pattern: /my\s+pattern/i,
  handler: this.parseMyCommand.bind(this)
}
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Thanks

Built with the amazing work from the Mineflayer team, the Prismarine community, and everyone who contributed ideas along the way.

## Links

- [Mineflayer GitHub](https://github.com/PrismarineJS/mineflayer)
- [Minecraft Protocol Wiki](https://wiki.vg/)
- [Prismarine Project](https://github.com/PrismarineJS)

---

**Status**: Alpha  
**Version**: v1 alpha  
**GitHub**: [@sxwik](https://github.com/sxwik)  
**Updated**: 2026
