class CombatAI {
  constructor(bot, logger) {
    this.bot = bot;
    this.logger = logger;
    this.enabled = false;
    this.isAttacking = false;
    this.targetEntity = null;
    this.hostileTypes = ['zombie', 'skeleton', 'creeper', 'spider', 'enderman', 'ghast', 'wither'];
    this.setupListeners();
  }

  setupListeners() {
    this.bot.on('entitySpawn', (entity) => {
      if (!this.enabled) return;
      if (this.isHostile(entity) && this.isNearby(entity)) {
        this.attack(entity);
      }
    });

    this.bot.on('entityHurt', (entity) => {
      if (!this.enabled) return;
      if (this.isHostile(entity)) {
        this.targetEntity = entity;
      }
    });
  }

  enable() {
    this.enabled = true;
    this.logger.info('Combat AI enabled');
  }

  disable() {
    this.enabled = false;
    this.stop();
    this.logger.info('Combat AI disabled');
  }

  isHostile(entity) {
    return this.hostileTypes.some(type => entity.name.includes(type));
  }

  isNearby(entity, distance = 20) {
    const dx = entity.position.x - this.bot.entity.position.x;
    const dy = entity.position.y - this.bot.entity.position.y;
    const dz = entity.position.z - this.bot.entity.position.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz) < distance;
  }

  attack(entity) {
    if (this.isAttacking || !this.enabled) return;

    this.isAttacking = true;
    this.targetEntity = entity;
    this.logger.info('Attacking', { entity: entity.name });

    const interval = setInterval(() => {
      if (!this.targetEntity || !this.isNearby(this.targetEntity)) {
        clearInterval(interval);
        this.isAttacking = false;
        this.targetEntity = null;
        return;
      }

      if (this.bot.health < 10) {
        this.retreat();
        clearInterval(interval);
        this.isAttacking = false;
        return;
      }

      this.bot.attack(this.targetEntity);
    }, 100);
  }

  retreat() {
    this.logger.warn('Retreating due to low health', { health: this.bot.health });
    this.isAttacking = false;

    const x = this.bot.entity.position.x - this.targetEntity.position.x;
    const z = this.bot.entity.position.z - this.targetEntity.position.z;
    const distance = Math.sqrt(x * x + z * z);

    if (distance < 10) {
      this.bot.setControlState('back', true);
      setTimeout(() => {
        this.bot.setControlState('back', false);
      }, 2000);
    }
  }

  stop() {
    this.isAttacking = false;
    this.targetEntity = null;
  }

  useShield() {
    const shield = this.bot.inventory.items().find(item => item.name === 'shield');
    if (shield) {
      this.bot.equip(shield, 'off-hand').catch(err => {
        this.logger.debug('Failed to equip shield', { error: err.message });
      });
    }
  }

  useBow(target) {
    const bow = this.bot.inventory.items().find(item => item.name === 'bow');
    const arrows = this.bot.inventory.items().find(item => item.name === 'arrow');

    if (bow && arrows) {
      this.bot.equip(bow, 'hand').then(() => {
        this.bot.activateItem();
        const angle = this.calculateAimAngle(target);
        setTimeout(() => {
          this.bot.deactivateItem();
        }, 500);
      }).catch(err => {
        this.logger.debug('Failed to use bow', { error: err.message });
      });
    }
  }

  calculateAimAngle(target) {
    const dx = target.position.x - this.bot.entity.position.x;
    const dz = target.position.z - this.bot.entity.position.z;
    const dy = target.position.y + (target.height / 2) - this.bot.entity.position.y;
    const distance = Math.sqrt(dx * dx + dz * dz);

    return Math.atan2(dy, distance);
  }

  guard(position, radius = 30) {
    this.logger.info('Guarding position', { position, radius });

    const guardInterval = setInterval(() => {
      if (!this.enabled) {
        clearInterval(guardInterval);
        return;
      }

      const entities = Object.values(this.bot.entities);
      for (const entity of entities) {
        if (this.isHostile(entity) && this.isNearby(entity, radius)) {
          this.attack(entity);
        }
      }
    }, 1000);
  }
}

module.exports = CombatAI;
