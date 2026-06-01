const mineflayer = require('mineflayer');
const ConfigLoader = require('./utils/configLoader');
const Logger = require('./utils/logger');
const PermissionManager = require('./utils/permissionManager');
const CommandHandler = require('./commands/commandHandler');
const MemoryManager = require('./memory/memoryManager');
const { TaskQueue } = require('./tasks/taskQueue');
const Movement = require('./movement/movement');
const SurvivalAI = require('./survival/survivalAI');
const InventoryManager = require('./inventory/inventoryManager');
const MiningSystem = require('./mining/miningSystem');
const BuildingSystem = require('./building/buildingSystem');
const CombatAI = require('./combat/combatAI');
const AIInterpreter = require('./ai/aiInterpreter');
const MultiBotManager = require('./multiBot/multiBotManager');

class MinecraftBot {
  constructor(configPath) {
    this.configLoader = new ConfigLoader();
    this.config = this.configLoader.load();
    this.logger = new Logger({ level: this.config.logging.level });
    this.permissionManager = new PermissionManager(this.config);
    this.memoryManager = null;
    this.commandHandler = null;
    this.taskQueue = null;
    this.movement = null;
    this.survivalAI = null;
    this.inventoryManager = null;
    this.miningSystem = null;
    this.buildingSystem = null;
    this.combatAI = null;
    this.aiInterpreter = null;
    this.multiBotManager = null;
    this.bot = null;
    this.reconnectAttempts = 0;
    this.isConnected = false;
  }

  async start() {
    this.logger.info('Starting Minecraft Bot...');

    try {
      this.bot = mineflayer.createBot({
        host: this.config.server.host,
        port: this.config.server.port,
        username: this.config.server.username,
        auth: this.config.server.auth
      });

      this.memoryManager = new MemoryManager(this.config);
      this.commandHandler = new CommandHandler(this.bot, this.logger, this.permissionManager);
      this.taskQueue = new TaskQueue(this.bot, this.logger);
      this.movement = new Movement(this.bot, this.logger);
      this.survivalAI = new SurvivalAI(this.bot, this.logger, this.config);
      this.inventoryManager = new InventoryManager(this.bot, this.logger);
      this.miningSystem = new MiningSystem(this.bot, this.logger, this.inventoryManager);
      this.buildingSystem = new BuildingSystem(this.bot, this.logger, this.inventoryManager);
      this.combatAI = new CombatAI(this.bot, this.logger);
      this.aiInterpreter = new AIInterpreter(this.bot, this.logger, this.taskQueue);
      this.multiBotManager = new MultiBotManager(this.logger, this.config);

      this.setupEventHandlers();
      this.registerCommands();
      this.registerTaskHandlers();

      if (this.config.features.survival) {
        this.survivalAI.enable();
      }

      this.taskQueue.start();

      this.logger.info('Bot systems initialized');
    } catch (err) {
      this.logger.error('Failed to start bot', { error: err.message });
      throw err;
    }
  }

  setupEventHandlers() {
    this.bot.once('spawn', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.logger.info('Bot spawned successfully');
      this.bot.chat('TickelBot online and ready for bad decisions 😎');
    });

    this.bot.on('chat', (username, message) => {
      if (username === this.bot.username) return;
      this.handleChat(username, message);
    });

    this.bot.on('error', (err) => {
      this.logger.error('Bot error', { error: err.message });
    });

    this.bot.on('kicked', (reason) => {
      this.logger.warn('Bot kicked', { reason });
      this.isConnected = false;
      if (this.config.bot.autoReconnect) {
        this.reconnect();
      }
    });

    this.bot.on('end', (reason) => {
      this.logger.info('Bot disconnected', { reason });
      this.isConnected = false;
      if (this.config.bot.autoReconnect) {
        this.reconnect();
      }
    });

    this.bot.on('health', () => {
      if (this.bot.health < 1) {
        this.logger.warn('Bot died');
        this.bot.chat('That zombie got lucky 😤');
        this.survivalAI.handleRespawn();
      }
    });
  }

  registerCommands() {
    this.commandHandler.register('help', {
      description: 'Show available commands',
      handler: ({ bot }) => {
        const commands = this.commandHandler.listCommands();
        let helpText = 'Available commands: ';
        helpText += commands.map(cmd => `!${cmd.name}`).join(', ');
        bot.chat(helpText);
      }
    });

    this.commandHandler.register('ping', {
      description: 'Ping the bot',
      handler: ({ bot }) => {
        bot.chat('Pong!');
      }
    });

    this.commandHandler.register('goto', {
      description: 'Go to coordinates (!goto x y z)',
      handler: ({ bot, args }) => {
        if (args.length < 3) {
          bot.chat('Usage: !goto <x> <y> <z>');
          return;
        }
        const x = parseInt(args[0]);
        const y = parseInt(args[1]);
        const z = parseInt(args[2]);
        bot.chat('On my way! 🏃💨');
        this.movement.goto(x, y, z)
          .then(() => bot.chat('I\'m here boss 😎'))
          .catch(err => {
            if (err.message === 'Cannot find path') {
              bot.chat('My GPS just gave up 💀');
            } else {
              bot.chat(`I tripped: ${err.message} 😭`);
            }
          });
      }
    });

    this.commandHandler.register('follow', {
      description: 'Follow a player',
      handler: ({ bot, args }) => {
        if (args.length < 1) {
          bot.chat('Usage: !follow <player>');
          return;
        }
        const player = this.bot.players[args[0]];
        if (!player) {
          bot.chat('Bro where did you go? I can\'t see you anymore 😭');
          return;
        }
        if (!player.entity) {
          bot.chat('Bro you\'re so far away you\'re not even rendered 💀');
          return;
        }
        bot.chat('I am now your emotional support bot 🤗');
        this.movement.follow(player.entity)
          .catch(err => {
            if (err.message === 'Player lost') bot.chat('I lost visual contact with you, captain 🫡');
            this.logger.debug('Follow error', { error: err.message });
          });
      }
    });

    this.commandHandler.register('stop', {
      description: 'Stop current movement',
      handler: ({ bot }) => {
        this.movement.stop();
        bot.chat('Taking a break 🛑');
      }
    });

    this.commandHandler.register('come', {
      description: 'Come to the caller',
      handler: ({ bot, username }) => {
        bot.chat('On my way boss 🏃💨');
        this.movement.come(username)
          .then(() => bot.chat('You called, I delivered 🏃💨'))
          .catch(err => {
            if (err.message.includes('Cannot find player')) {
              bot.chat("Bro you're so far away you're not even rendered 💀");
            } else if (err.message === 'Cannot find path') {
              bot.chat("There's some cursed terrain between us 😭 My GPS gave up.");
            } else {
              bot.chat(`Failed: ${err.message}`);
            }
          });
      }
    });

    this.commandHandler.register('sethome', {
      description: 'Set home location',
      handler: ({ bot }) => {
        this.memoryManager.setHome(this.bot.entity.position);
        bot.chat('Memorized this spot! 🏡');
      }
    });

    this.commandHandler.register('home', {
      description: 'Go home',
      handler: ({ bot }) => {
        const home = this.memoryManager.getHome();
        if (!home) {
          bot.chat('I am homeless 😭 Set a home first!');
          return;
        }
        this.movement.goto(home.x, home.y, home.z)
          .then(() => bot.chat('Home sweet home 🏡'))
          .catch(err => bot.chat(`Failed: ${err.message}`));
      }
    });

    this.commandHandler.register('mine', {
      description: 'Mine ore (!mine <ore>)',
      handler: ({ bot, args }) => {
        if (args.length < 1) {
          bot.chat('Usage: !mine <ore>');
          return;
        }
        const ore = args[0];
        bot.chat(`Time to commit industrial mining for ${ore} ⛏️`);
        this.taskQueue.addTask(`mine-${ore}`, 'mine', { ore }, 1);
      }
    });

    this.commandHandler.register('inventory', {
      description: 'Show inventory',
      handler: ({ bot }) => {
        const inv = this.inventoryManager.getInventory();
        const items = inv.filter(item => item.name).map(item => `${item.name}(${item.count})`);
        bot.chat('Inventory: ' + items.join(', '));
      }
    });

    this.commandHandler.register('ai', {
      description: 'Execute AI command (!ai <command>)',
      handler: ({ bot, args }) => {
        const command = args.join(' ');
        const parsed = this.aiInterpreter.parseCommand(command);
        if (parsed) {
          this.aiInterpreter.executeCommand(parsed);
          bot.chat(`Executing: ${parsed.description}`);
        } else {
          bot.chat('Command not understood');
        }
      }
    });

    this.commandHandler.register('survive', {
      description: 'Toggle survival mode',
      handler: ({ bot, args }) => {
        if (args[0] === 'on') {
          this.survivalAI.enable();
          bot.chat('Survival instincts activated ⚔️');
        } else if (args[0] === 'off') {
          this.survivalAI.disable();
          bot.chat('I am now completely helpless 🏳️');
        }
      }
    });

    this.commandHandler.register('status', {
      description: 'Show bot status',
      handler: ({ bot }) => {
        const pos = this.movement.getPosition();
        bot.chat(`❤️ ${Math.floor(this.bot.health)}/20 | 🍗 ${Math.floor(this.bot.food)}/20 | 📍 Chilling at ${Math.floor(pos.x)}, ${Math.floor(pos.y)}, ${Math.floor(pos.z)}`);
      }
    });
  }

  registerTaskHandlers() {
    this.taskQueue.registerHandler('mine', async (task, bot) => {
      await this.miningSystem.findAndMineOre(task.data.ore || task.data.targetOre, 50, 10);
    });

    this.taskQueue.registerHandler('navigate', async (task, bot) => {
      const location = task.data.location;
      if (location === 'home') {
        const home = this.memoryManager.getHome();
        if (home) {
          await this.movement.goto(home.x, home.y, home.z);
        }
      }
    });

    this.taskQueue.registerHandler('build', async (task, bot) => {
      this.logger.info('Build task started');
    });

    this.taskQueue.registerHandler('farm', async (task, bot) => {
      this.logger.info('Farm task started');
    });

    this.taskQueue.registerHandler('guard', async (task, bot) => {
      this.combatAI.enable();
      this.combatAI.guard(this.movement.getPosition(), task.data.radius);
    });
  }

  async handleChat(username, message) {
    const isCommand = message.startsWith('!');
    
    if (isCommand) {
      const executed = await this.commandHandler.execute(username, message.slice(1));
      if (!executed) {
        this.bot.chat(`Unknown command: ${message}`);
      }
    } else {
      this.logger.info(`Chat [${username}]: ${message}`);
    }
  }

  async reconnect() {
    if (this.reconnectAttempts >= this.config.bot.maxReconnectAttempts) {
      this.logger.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    this.logger.info(`Reconnecting... (Attempt ${this.reconnectAttempts}/${this.config.bot.maxReconnectAttempts})`);

    await new Promise(resolve => setTimeout(resolve, this.config.bot.reconnectDelay));
    this.start();
  }

  stop() {
    this.logger.info('Stopping bot...');
    if (this.taskQueue) this.taskQueue.stop();
    if (this.memoryManager) this.memoryManager.destroy();
    if (this.bot) this.bot.quit();
    this.isConnected = false;
  }

  getStatus() {
    return {
      connected: this.isConnected,
      health: this.bot?.health || 0,
      hunger: this.bot?.food || 0,
      position: this.movement ? this.movement.getPosition() : { x: 0, y: 0, z: 0 },
      taskStatus: this.taskQueue?.getStatus() || {},
      multiBots: this.multiBotManager?.getSystemStatus() || {}
    };
  }
}

module.exports = MinecraftBot;
