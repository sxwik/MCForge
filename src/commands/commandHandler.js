class CommandHandler {
  constructor(bot, logger, permissionManager) {
    this.bot = bot;
    this.logger = logger;
    this.permissionManager = permissionManager;
    this.commands = new Map();
  }

  register(name, options) {
    const { handler, description, aliases = [], permission = 'user' } = options;
    
    this.commands.set(name, {
      handler,
      description,
      permission,
      aliases
    });

    aliases.forEach(alias => {
      this.commands.set(alias, { ...this.commands.get(name), isAlias: true });
    });
  }

  async execute(username, message) {
    const parts = message.trim().split(/\s+/);
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (!this.commands.has(commandName)) {
      return false;
    }

    const command = this.commands.get(commandName);

    if (!this.permissionManager.hasPermission(username, command.permission)) {
      this.bot.chat(`@${username} You don't have permission to use this command.`);
      this.logger.warn(`Permission denied for ${username} on command ${commandName}`);
      return true;
    }

    try {
      await command.handler({ bot: this.bot, username, args, message });
      this.logger.debug(`Command executed: ${commandName}`, { username, args });
    } catch (err) {
      this.bot.chat(`Error executing command: ${err.message}`);
      this.logger.error(`Command error: ${commandName}`, { error: err.message, username });
    }

    return true;
  }

  getCommand(name) {
    return this.commands.get(name.toLowerCase());
  }

  listCommands() {
    const list = [];
    const processed = new Set();
    
    this.commands.forEach((cmd, name) => {
      if (!cmd.isAlias && !processed.has(name)) {
        list.push({ name, description: cmd.description, permission: cmd.permission });
        processed.add(name);
      }
    });
    
    return list;
  }
}

module.exports = CommandHandler;
