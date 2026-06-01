class BuildingSystem {
  constructor(bot, logger, inventoryManager) {
    this.bot = bot;
    this.logger = logger;
    this.inventoryManager = inventoryManager;
    this.isBuilding = false;
    this.buildProgress = 0;
  }

  async placeBlock(x, y, z, blockName) {
    const block = this.bot.blockAt(x, y, z);
    if (!block) {
      this.logger.warn('Target position invalid', { x, y, z });
      return false;
    }

    const item = this.inventoryManager.findItem(blockName);
    if (!item) {
      this.logger.warn('Block not in inventory', { block: blockName });
      return false;
    }

    try {
      await this.bot.equip(item, 'hand');
      await this.bot.placeBlock(block);
      this.logger.info('Block placed', { block: blockName, x, y, z });
      return true;
    } catch (err) {
      this.logger.error('Failed to place block', { block: blockName, error: err.message });
      return false;
    }
  }

  async buildWall(startX, startY, startZ, length, height, blockName) {
    this.logger.info('Building wall', { startX, startY, startZ, length, height, blockName });
    this.isBuilding = true;
    this.buildProgress = 0;
    const totalBlocks = length * height;

    for (let x = 0; x < length; x++) {
      for (let y = 0; y < height; y++) {
        const success = await this.placeBlock(startX + x, startY + y, startZ, blockName);
        this.buildProgress = Math.round(((x * height + y + 1) / totalBlocks) * 100);
        if (!success) {
          this.logger.warn('Failed to place block in wall');
        }
      }
    }

    this.isBuilding = false;
    this.logger.info('Wall completed', { blockName, totalBlocks });
  }

  async buildHouse(baseX, baseY, baseZ, width, height, depth, blockName) {
    this.logger.info('Building house', { baseX, baseY, baseZ, width, height, depth, blockName });
    this.isBuilding = true;
    this.buildProgress = 0;

    const totalBlocks = (width * 2 + depth * 2) * height + width * depth;
    let placed = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let z = 0; z < depth; z++) {
          const isWall = x === 0 || x === width - 1 || z === 0 || z === depth - 1;
          if (isWall || y === height - 1) {
            const success = await this.placeBlock(baseX + x, baseY + y, baseZ + z, blockName);
            if (success) placed++;
            this.buildProgress = Math.round((placed / totalBlocks) * 100);
          }
        }
      }
    }

    this.isBuilding = false;
    this.logger.info('House completed', { placed });
  }

  async buildStructure(blocks) {
    this.logger.info('Building structure', { blockCount: blocks.length });
    this.isBuilding = true;
    this.buildProgress = 0;

    for (let i = 0; i < blocks.length; i++) {
      const { x, y, z, block } = blocks[i];
      await this.placeBlock(x, y, z, block);
      this.buildProgress = Math.round(((i + 1) / blocks.length) * 100);
    }

    this.isBuilding = false;
    this.logger.info('Structure completed');
  }

  parseSchematic(schematicData) {
    const blocks = [];
    const palette = schematicData.palette || {};
    const blockData = schematicData.blocks || [];

    blockData.forEach((block, index) => {
      blocks.push({
        x: block.x,
        y: block.y,
        z: block.z,
        block: palette[block.paletteIndex] || 'stone'
      });
    });

    return blocks;
  }

  getProgress() {
    return {
      isBuilding: this.isBuilding,
      progress: this.buildProgress
    };
  }
}

module.exports = BuildingSystem;
