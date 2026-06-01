class AIInterpreter {
  constructor(bot, logger, taskQueue) {
    this.bot = bot;
    this.logger = logger;
    this.taskQueue = taskQueue;
    this.patterns = this.initializePatterns();
  }

  initializePatterns() {
    return {
      gather: {
        pattern: /gather\s+(\d+)\s+([a-z_]+)/i,
        handler: this.parseGather.bind(this)
      },
      mine: {
        pattern: /mine\s+([a-z_]+)/i,
        handler: this.parseMine.bind(this)
      },
      goto: {
        pattern: /go\s+to\s+(.+)/i,
        handler: this.parseGoto.bind(this)
      },
      build: {
        pattern: /build\s+([a-z_\.]+)/i,
        handler: this.parseBuild.bind(this)
      },
      farm: {
        pattern: /farm\s+([a-z_]+)/i,
        handler: this.parseFarm.bind(this)
      },
      protect: {
        pattern: /protect\s+(?:area|place|location)?/i,
        handler: this.parseProtect.bind(this)
      },
      follow: {
        pattern: /follow\s+([a-z_]+)/i,
        handler: this.parseFollow.bind(this)
      },
      stop: {
        pattern: /stop|halt|pause/i,
        handler: this.parseStop.bind(this)
      }
    };
  }

  parseCommand(input) {
    input = input.toLowerCase().trim();

    for (const [key, { pattern, handler }] of Object.entries(this.patterns)) {
      const match = input.match(pattern);
      if (match) {
        return handler(match);
      }
    }

    return null;
  }

  parseGather(match) {
    const count = parseInt(match[1]);
    const itemType = match[2];

    return {
      type: 'gather',
      action: 'mining',
      targetItem: itemType,
      targetCount: count,
      description: `Gather ${count} ${itemType}`
    };
  }

  parseMine(match) {
    const oreType = match[1];

    return {
      type: 'mine',
      action: 'mining',
      targetOre: oreType,
      description: `Mine ${oreType}`
    };
  }

  parseGoto(match) {
    const location = match[1].trim();
    const knownLocations = {
      'home': 'home',
      'base': 'home',
      'storage': 'storage',
      'mine': 'mines',
      'farm': 'farm'
    };

    const locationKey = knownLocations[location] || location;

    return {
      type: 'navigation',
      action: 'goto',
      location: locationKey,
      description: `Go to ${location}`
    };
  }

  parseBuild(match) {
    const schematic = match[1];

    return {
      type: 'building',
      action: 'build',
      schematic: schematic,
      description: `Build ${schematic}`
    };
  }

  parseFarm(match) {
    const crop = match[1];

    return {
      type: 'farming',
      action: 'harvest',
      crop: crop,
      description: `Farm ${crop}`
    };
  }

  parseProtect(match) {
    return {
      type: 'combat',
      action: 'guard',
      radius: 50,
      description: 'Guard current position'
    };
  }

  parseFollow(match) {
    const player = match[1];

    return {
      type: 'navigation',
      action: 'follow',
      player: player,
      description: `Follow ${player}`
    };
  }

  parseStop(match) {
    return {
      type: 'control',
      action: 'stop',
      description: 'Stop current task'
    };
  }

  async executeCommand(commandObj) {
    if (!commandObj) {
      this.logger.warn('Invalid command');
      return false;
    }

    this.logger.info('Executing AI command', { command: commandObj.description });

    switch (commandObj.type) {
      case 'gather':
        this.taskQueue.addTask(`gather-${commandObj.targetItem}`, 'mine', commandObj, 1);
        break;
      case 'mine':
        this.taskQueue.addTask(`mine-${commandObj.targetOre}`, 'mine', commandObj, 1);
        break;
      case 'navigation':
        this.taskQueue.addTask(`navigate-${commandObj.location}`, 'navigate', commandObj, 1);
        break;
      case 'building':
        this.taskQueue.addTask(`build-${commandObj.schematic}`, 'build', commandObj, 2);
        break;
      case 'farming':
        this.taskQueue.addTask(`farm-${commandObj.crop}`, 'farm', commandObj, 1);
        break;
      case 'combat':
        this.taskQueue.addTask(`guard-area`, 'guard', commandObj, 3);
        break;
      case 'control':
        if (commandObj.action === 'stop') {
          this.taskQueue.stop();
        }
        break;
    }

    return true;
  }
}

module.exports = AIInterpreter;
