const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

class Movement {
  constructor(bot, logger) {
    this.bot = bot;
    this.logger = logger;
    this.isMoving = false;
    this.currentGoal = null;
    this.stuckCounter = 0;
    this.lastPosition = { x: 0, y: 0, z: 0 };
    
    bot.loadPlugin(pathfinder);
    
    this.mcData = null;
    this.movements = null;
    
    this.setupEventListeners();

    bot.once('spawn', () => {
      this.mcData = require('minecraft-data')(this.bot.version);
      this.movements = new Movements(this.bot, this.mcData);
      this.logger.info('Movement system initialized', {
        version: this.bot.version
      });

      if (this.bot.entity && this.bot.entity.position) {
        this.lastPosition = {
          x: this.bot.entity.position.x,
          y: this.bot.entity.position.y,
          z: this.bot.entity.position.z
        };
      }
    });
  }

  setupEventListeners() {
    this.bot.on('move', () => {
      this.checkStuck();
    });
  }

  checkStuck() {
    if (!this.bot.entity || !this.bot.entity.position) {
      return;
    }

    const pos = this.bot.entity.position;
    const distance = Math.sqrt(
      Math.pow(pos.x - this.lastPosition.x, 2) +
      Math.pow(pos.y - this.lastPosition.y, 2) +
      Math.pow(pos.z - this.lastPosition.z, 2)
    );

    if (distance < 0.1 && this.isMoving) {
      this.stuckCounter++;
      if (this.stuckCounter > 100) {
        this.logger.warn('Bot stuck, trying to escape');
        this.bot.setControlState('forward', false);
        this.bot.setControlState('jump', true);
        setTimeout(() => {
          this.bot.setControlState('jump', false);
          this.stuckCounter = 0;
        }, 500);
      }
    } else {
      this.stuckCounter = 0;
    }

    this.lastPosition = pos;
  }

  async goto(x, y, z, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const goal = new goals.GoalBlock(x, y, z);
      this.currentGoal = goal;
      this.isMoving = true;

      const timeoutId = setTimeout(() => {
        this.bot.pathfinder.setGoal(null);
        this.isMoving = false;
        reject(new Error('Pathfinding timeout'));
      }, timeout);

      if (!this.movements) {
        clearTimeout(timeoutId);
        throw new Error('Movement system not initialized yet');
      }

      this.bot.pathfinder.setMovements(this.movements);
      this.bot.pathfinder.setGoal(goal, false);

      this.bot.pathfinder.on('goal_reached', () => {
        clearTimeout(timeoutId);
        this.isMoving = false;
        this.logger.info('Reached goal', { x, y, z });
        resolve();
      });

      this.bot.pathfinder.on('cant_find_path', () => {
        clearTimeout(timeoutId);
        this.isMoving = false;
        reject(new Error('Cannot find path'));
      });
    });
  }

  async follow(player, stoppingDistance = 3) {
    return new Promise((resolve, reject) => {
      const goal = new goals.GoalFollow(player, stoppingDistance);
      this.currentGoal = goal;
      this.isMoving = true;

      this.bot.pathfinder.setMovements(this.movements);
      this.bot.pathfinder.setGoal(goal, false);

      const checkInterval = setInterval(() => {
        if (!player || !this.bot.players[player.username]) {
          clearInterval(checkInterval);
          this.bot.pathfinder.setGoal(null);
          this.isMoving = false;
          reject(new Error('Player lost'));
        }
      }, 1000);
    });
  }

  stop() {
    this.bot.pathfinder.setGoal(null);
    this.isMoving = false;
    this.currentGoal = null;
    this.logger.info('Movement stopped');
  }

  come(playerOrUsername) {
    let target;

    if (typeof playerOrUsername === 'string') {
      target = this.bot.players[playerOrUsername];
    } else {
      target = playerOrUsername;
    }

    if (!target || !target.entity) {
      throw new Error(`Cannot find player`);
    }

    return this.goto(
      Math.floor(target.entity.position.x),
      Math.floor(target.entity.position.y),
      Math.floor(target.entity.position.z)
    );
  }

  async wander(radius = 50) {
    return new Promise((resolve) => {
      const wandering = setInterval(() => {
        if (!this.isMoving) {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * radius;
          const x = Math.floor(this.bot.entity.position.x + Math.cos(angle) * distance);
          const z = Math.floor(this.bot.entity.position.z + Math.sin(angle) * distance);
          const y = Math.floor(this.bot.entity.position.y);

          this.goto(x, y, z).catch(err => {
            this.logger.debug('Wander navigation failed', { error: err.message });
          });
        }
      }, 5000);

      return () => {
        clearInterval(wandering);
        resolve();
      };
    });
  }

  getPosition() {
    if (!this.bot.entity || !this.bot.entity.position) {
        return {
            x: 0,
            y: 0,
            z: 0,
            ready: false
        };
    }

    const pos = this.bot.entity.position;
    return {
        x: pos.x,
        y: pos.y,
        z: pos.z,
        ready: true
    };
  }
}

module.exports = Movement;
