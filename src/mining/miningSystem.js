class MiningSystem {
  constructor(bot, logger, inventoryManager) {
    this.bot = bot;
    this.logger = logger;
    this.inventoryManager = inventoryManager;
    this.isMining = false;
    this.oreBlacklist = [];
    this.orePriority = ['diamond_ore', 'emerald_ore', 'iron_ore', 'gold_ore', 'lapis_ore', 'redstone_ore'];
  }

  async mineBlock(x, y, z) {
    const block = this.bot.blockAt(x, y, z);
    if (!block) {
      this.logger.warn('Block not found', { x, y, z });
      return false;
    }

    return new Promise((resolve) => {
      this.isMining = true;
      this.logger.info('Started mining', { block: block.name, x, y, z });

      this.bot.dig(block, false, err => {
        this.isMining = false;
        if (err) {
          this.logger.error('Mining failed', { block: block.name, error: err.message });
          resolve(false);
        } else {
          this.logger.info('Block mined', { block: block.name });
          resolve(true);
        }
      });
    });
  }

  async stripMine(x, z, length = 100, width = 3, depth = 50) {
    this.logger.info('Starting strip mine', { x, z, length, width, depth });

    for (let l = 0; l < length; l++) {
      for (let w = 0; w < width; w++) {
        const posX = x + w;
        const posZ = z + l;

        for (let d = 0; d < depth; d++) {
          const posY = this.bot.entity.position.y - d;
          const block = this.bot.blockAt(posX, posY, posZ);

          if (block && this.isValuableOre(block.name)) {
            await this.mineBlock(posX, posY, posZ);
          }
        }
      }
    }

    this.logger.info('Strip mine completed');
  }

  async findAndMineOre(oreName, maxDistance = 50, maxOres = 10) {
    const mcData = require('minecraft-data')(this.bot.version);
    let mined = 0;

    while (mined < maxOres) {
      const ore = this.bot.findBlock({
        matching: block => {
          const name = mcData.blocksByStateId[block.stateId]?.name;
          return name === oreName;
        },
        maxDistance
      });

      if (!ore) {
        this.logger.info('No more ore found', { ore: oreName });
        break;
      }

      const success = await this.mineBlock(ore.position.x, ore.position.y, ore.position.z);
      if (success) {
        mined++;
      } else {
        this.oreBlacklist.push(ore.position);
      }
    }

    this.logger.info('Mining completed', { ore: oreName, count: mined });
    return mined;
  }

  async quarryMode(centerX, centerZ, radius = 50, depth = 50) {
    this.logger.info('Starting quarry mode', { centerX, centerZ, radius, depth });

    for (let x = centerX - radius; x <= centerX + radius; x++) {
      for (let z = centerZ - radius; z <= centerZ + radius; z++) {
        for (let y = 64; y >= 64 - depth; y--) {
          const block = this.bot.blockAt(x, y, z);
          if (block && !block.name.includes('liquid') && block.name !== 'bedrock' && block.name !== 'void_air') {
            await this.mineBlock(x, y, z);
          }
        }
      }
    }

    this.logger.info('Quarry mode completed');
  }

  isValuableOre(blockName) {
    return this.orePriority.some(ore => ore === blockName);
  }

  selectBestTool(blockName) {
    const toolMap = {
      diamond: ['diamond_pickaxe', 'netherite_pickaxe'],
      iron: ['iron_pickaxe', 'diamond_pickaxe', 'netherite_pickaxe'],
      stone: ['stone_pickaxe', 'iron_pickaxe', 'diamond_pickaxe', 'netherite_pickaxe'],
      dirt: ['wooden_pickaxe', 'stone_pickaxe', 'iron_pickaxe']
    };

    let category = 'stone';
    if (blockName.includes('diamond') || blockName.includes('obsidian')) category = 'diamond';
    else if (blockName.includes('iron') || blockName.includes('lapis') || blockName.includes('redstone')) category = 'iron';
    else if (blockName.includes('stone') || blockName.includes('coal')) category = 'stone';

    const tools = toolMap[category];
    for (const tool of tools) {
      if (this.inventoryManager.findItem(tool)) {
        this.inventoryManager.equipTool(tool);
        return tool;
      }
    }

    return null;
  }
}

module.exports = MiningSystem;
