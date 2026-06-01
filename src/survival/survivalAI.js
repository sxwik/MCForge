class SurvivalAI {
  constructor(bot, logger, config) {
    this.bot = bot;
    this.logger = logger;
    this.config = config.survival;
    this.enabled = false;
    this.setupListeners();
  }

  setupListeners() {
    this.bot.on('time', () => {
      if (!this.enabled) return;
      this.tick();
    });

    this.bot.on('health', () => {
      if (!this.enabled) return;
      this.handleHealth();
    });
  }

  enable() {
    this.enabled = true;
    this.logger.info('Survival AI enabled');
  }

  disable() {
    this.enabled = false;
    this.logger.info('Survival AI disabled');
  }

  tick() {
    if (this.config.autoEat) this.autoEat();
    if (this.config.autoEquipArmor) this.autoEquipArmor();
    if (this.config.autoSleep) this.autoSleep();
  }

  autoEat() {
    if (typeof this.bot.food === 'undefined' || !this.bot.inventory) return;

    if (this.bot.food >= this.config.hungerThreshold) return;
    if (this.bot.foodSaturation >= 0.1) return;

    const foods = ['cooked_beef', 'cooked_chicken', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'carrot'];
    let foodItem = null;

    for (const food of foods) {
      foodItem = this.bot.inventory.items().find(item => item.name === food);
      if (foodItem) break;
    }

    if (foodItem) {
      this.bot.equip(foodItem, 'hand').then(() => {
        this.bot.consume().then(() => {
          this.logger.debug('Ate food', { food: foodItem.name });
        });
      }).catch(err => {
        this.logger.warn('Failed to eat', { error: err.message });
      });
    }
  }

  autoEquipArmor() {
    if (!this.bot.inventory) return;

    const armorPieces = ['helmet', 'chestplate', 'leggings', 'boots'];
    const armorNames = ['diamond', 'iron', 'netherite', 'gold', 'chainmail', 'leather'];

    for (const piece of armorPieces) {
      const slot = {
        helmet: 5,
        chestplate: 4,
        leggings: 3,
        boots: 2
      }[piece];

      const currentItem = this.bot.inventory.slots[slot];
      const bestArmor = this.bot.inventory.items().find(item => 
        armorNames.some(armor => item.name.includes(armor)) && 
        item.name.endsWith(piece)
      );

      if (bestArmor && (!currentItem || currentItem.name < bestArmor.name)) {
        this.bot.equip(bestArmor, piece).catch(err => {
          this.logger.debug('Failed to equip armor', { piece, error: err.message });
        });
      }
    }
  }

  autoSleep() {
    if (!this.config.sleepAtNight) return;

    if (!this.bot.time || typeof this.bot.time.timeOfDay === 'undefined') {
      return;
    }

    const time = this.bot.time.timeOfDay;
    if (time > 12541 || time < 23458) return;

    const bed = this.bot.findBlock({
      matching: block => {
        const name = this.bot.registry.blocksByStateId[block.stateId]?.name;
        return name && name.includes('bed');
      },
      maxDistance: 32
    });

    if (bed) {
      this.bot.sleep(bed).then(() => {
        this.logger.info('Going to sleep');
      }).catch(err => {
        this.logger.debug('Failed to sleep', { error: err.message });
      });
    }
  }

  handleHealth() {
    if (typeof this.bot.health === 'undefined' || !this.bot.inventory) return;

    if (this.bot.health < this.config.healthThreshold) {
      const foods = ['cooked_beef', 'cooked_chicken', 'cooked_mutton', 'cooked_porkchop', 'bread'];
      let foodItem = null;

      for (const food of foods) {
        foodItem = this.bot.inventory.items().find(item => item.name === food);
        if (foodItem) break;
      }

      if (foodItem) {
        this.bot.equip(foodItem, 'hand').then(() => {
          this.bot.consume().then(() => {
            this.logger.debug('Emergency eat', { health: this.bot.health });
          });
        }).catch(err => {
          this.logger.warn('Failed emergency eat', { error: err.message });
        });
      }
    }
  }

  handleRespawn() {
    this.logger.info('Bot died, respawning');
    setTimeout(() => {
      this.bot.setControlState('jump', true);
      setTimeout(() => {
        this.bot.setControlState('jump', false);
      }, 100);
    }, 500);
  }
}

module.exports = SurvivalAI;
