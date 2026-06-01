class InventoryManager {
  constructor(bot, logger) {
    this.bot = bot;
    this.logger = logger;
  }

  getInventory() {
    return this.bot.inventory.slots.map((item, index) => ({
      slot: index,
      name: item ? item.name : null,
      count: item ? item.count : 0,
      metadata: item ? item.metadata : null
    }));
  }

  countItem(itemName) {
    let count = 0;
    this.bot.inventory.items().forEach(item => {
      if (item.name === itemName) {
        count += item.count;
      }
    });
    return count;
  }

  findItem(itemName) {
    return this.bot.inventory.items().find(item => item.name === itemName);
  }

  getHotbar() {
    return this.bot.inventory.slots.slice(36, 45).map((item, index) => ({
      slot: 36 + index,
      name: item ? item.name : null,
      count: item ? item.count : 0
    }));
  }

  depositItem(itemName, count = 1) {
    const items = this.bot.inventory.items().filter(item => item.name === itemName);
    let deposited = 0;

    for (const item of items) {
      if (deposited >= count) break;
      const toDeposit = Math.min(item.count, count - deposited);
      
      this.bot.inventory.move(item, null).catch(err => {
        this.logger.warn('Failed to deposit item', { item: itemName, error: err.message });
      });

      deposited += toDeposit;
    }

    this.logger.info('Items deposited', { item: itemName, count: deposited });
    return deposited;
  }

  withdrawItem(itemName, count = 1) {
    const item = this.findItem(itemName);
    if (!item) {
      this.logger.warn('Item not found', { item: itemName });
      return 0;
    }

    const toWithdraw = Math.min(item.count, count);
    const hotbarSlot = this.bot.inventory.firstEmptySlot();

    if (hotbarSlot) {
      this.bot.inventory.moveSlotItem(item.slot, hotbarSlot).catch(err => {
        this.logger.warn('Failed to withdraw item', { item: itemName, error: err.message });
      });
    }

    this.logger.info('Item withdrawn', { item: itemName, count: toWithdraw });
    return toWithdraw;
  }

  sortInventory() {
    const inventory = this.getInventory();
    const items = {};

    inventory.forEach(slot => {
      if (slot.name) {
        if (!items[slot.name]) {
          items[slot.name] = [];
        }
        items[slot.name].push(slot);
      }
    });

    this.logger.info('Inventory sorted');
    return items;
  }

  async equipTool(toolName) {
    const tool = this.findItem(toolName);
    if (!tool) {
      this.logger.warn('Tool not found', { tool: toolName });
      return false;
    }

    await this.bot.equip(tool, 'hand');
    this.logger.info('Tool equipped', { tool: toolName });
    return true;
  }
}

module.exports = InventoryManager;
