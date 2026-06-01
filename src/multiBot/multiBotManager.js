class MultiBotManager {
  constructor(logger, config) {
    this.logger = logger;
    this.config = config;
    this.bots = new Map();
    this.botTypes = {
      'builder': { role: 'building', capabilities: ['build', 'place', 'inventory'] },
      'miner': { role: 'mining', capabilities: ['mine', 'navigate', 'inventory'] },
      'farmer': { role: 'farming', capabilities: ['harvest', 'replant', 'inventory'] },
      'guard': { role: 'combat', capabilities: ['fight', 'patrol', 'protect'] }
    };
  }

  createBot(name, type, botInstance) {
    if (!this.botTypes[type]) {
      throw new Error(`Unknown bot type: ${type}`);
    }

    const botConfig = {
      name,
      type,
      instance: botInstance,
      status: 'idle',
      health: 20,
      hunger: 20,
      inventory: [],
      position: { x: 0, y: 0, z: 0 },
      task: null,
      capabilities: this.botTypes[type].capabilities
    };

    this.bots.set(name, botConfig);
    this.logger.info(`Bot created: ${name} (${type})`);

    return botConfig;
  }

  getBot(name) {
    return this.bots.get(name);
  }

  listBots() {
    const bots = [];
    this.bots.forEach((bot, name) => {
      bots.push({
        name,
        type: bot.type,
        status: bot.status,
        health: bot.health,
        hunger: bot.hunger,
        position: bot.position,
        task: bot.task
      });
    });
    return bots;
  }

  updateBotStatus(name, status) {
    const bot = this.bots.get(name);
    if (bot) {
      bot.status = status;
      this.logger.info(`Bot status updated: ${name} -> ${status}`);
    }
  }

  updateBotHealth(name, health) {
    const bot = this.bots.get(name);
    if (bot) {
      bot.health = health;
    }
  }

  updateBotHunger(name, hunger) {
    const bot = this.bots.get(name);
    if (bot) {
      bot.hunger = hunger;
    }
  }

  updateBotPosition(name, x, y, z) {
    const bot = this.bots.get(name);
    if (bot) {
      bot.position = { x, y, z };
    }
  }

  assignTask(name, task) {
    const bot = this.bots.get(name);
    if (bot) {
      bot.task = task;
      bot.status = 'working';
      this.logger.info(`Task assigned to ${name}:`, task);
    }
  }

  getBotsWithCapability(capability) {
    const matching = [];
    this.bots.forEach((bot, name) => {
      if (bot.capabilities.includes(capability)) {
        matching.push(name);
      }
    });
    return matching;
  }

  getBotsByType(type) {
    const matching = [];
    this.bots.forEach((bot, name) => {
      if (bot.type === type) {
        matching.push(name);
      }
    });
    return matching;
  }

  coordinateBots(task) {
    const requiredCapabilities = task.requiredCapabilities || [];
    const availableBots = this.getAvailableBots();

    const assignments = [];

    for (const capability of requiredCapabilities) {
      const botsWithCap = this.getBotsWithCapability(capability)
        .filter(name => availableBots.includes(name));

      if (botsWithCap.length === 0) {
        this.logger.warn(`No available bots with capability: ${capability}`);
        continue;
      }

      const botName = botsWithCap[0];
      this.assignTask(botName, task);
      assignments.push({ bot: botName, capability });
    }

    return assignments;
  }

  getAvailableBots() {
    const available = [];
    this.bots.forEach((bot, name) => {
      if (bot.status === 'idle') {
        available.push(name);
      }
    });
    return available;
  }

  broadcast(message) {
    this.bots.forEach((bot) => {
      if (bot.instance && bot.instance.chat) {
        bot.instance.chat(message);
      }
    });
  }

  getSystemStatus() {
    let totalHealth = 0;
    let totalHunger = 0;
    let workingBots = 0;

    this.bots.forEach(bot => {
      totalHealth += bot.health;
      totalHunger += bot.hunger;
      if (bot.status === 'working') workingBots++;
    });

    return {
      totalBots: this.bots.size,
      activeBots: workingBots,
      averageHealth: this.bots.size > 0 ? totalHealth / this.bots.size : 0,
      averageHunger: this.bots.size > 0 ? totalHunger / this.bots.size : 0,
      bots: this.listBots()
    };
  }
}

module.exports = MultiBotManager;
