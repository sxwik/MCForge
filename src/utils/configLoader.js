const fs = require('fs');
const path = require('path');

class ConfigLoader {
  constructor() {
    this.config = null;
    this.configPath = path.join(__dirname, '../config/default.json');
  }

  load() {
    try {
      const configContent = fs.readFileSync(this.configPath, 'utf8');
      this.config = JSON.parse(configContent);
      
      // Override with environment variables
      if (process.env.SERVER_HOST) this.config.server.host = process.env.SERVER_HOST;
      if (process.env.SERVER_PORT) this.config.server.port = parseInt(process.env.SERVER_PORT);
      if (process.env.BOT_USERNAME) this.config.server.username = process.env.BOT_USERNAME;
      if (process.env.DASHBOARD_PORT) this.config.dashboard.port = parseInt(process.env.DASHBOARD_PORT);
      
      return this.config;
    } catch (err) {
      throw new Error(`Failed to load config: ${err.message}`);
    }
  }

  get() {
    return this.config;
  }

  set(key, value) {
    const keys = key.split('.');
    let obj = this.config;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
  }

  save() {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (err) {
      throw new Error(`Failed to save config: ${err.message}`);
    }
  }
}

module.exports = ConfigLoader;
