const fs = require('fs');
const path = require('path');

class Logger {
  constructor(options = {}) {
    this.level = options.level || 'info';
    this.logDir = options.logDir || './src/logs';
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024;
    this.maxFiles = options.maxFiles || 5;
    
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    
    this.levels = { error: 0, warn: 1, info: 2, debug: 3 };
    this.currentLogFile = this.getLogFile();
  }

  getLogFile() {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `bot-${date}.log`);
  }

  checkRotation() {
    if (fs.existsSync(this.currentLogFile)) {
      const stats = fs.statSync(this.currentLogFile);
      if (stats.size > this.maxFileSize) {
        this.rotateLog();
      }
    }
  }

  rotateLog() {
    const files = fs.readdirSync(this.logDir).sort().reverse();
    if (files.length >= this.maxFiles) {
      fs.unlinkSync(path.join(this.logDir, files[files.length - 1]));
    }
  }

  log(level, message, data = {}) {
    if (this.levels[level] > this.levels[this.level]) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    const fullMessage = Object.keys(data).length > 0 
      ? `${logMessage} ${JSON.stringify(data)}` 
      : logMessage;

    console.log(fullMessage);
    
    this.checkRotation();
    fs.appendFileSync(this.currentLogFile, fullMessage + '\n');
  }

  error(message, data) { this.log('error', message, data); }
  warn(message, data) { this.log('warn', message, data); }
  info(message, data) { this.log('info', message, data); }
  debug(message, data) { this.log('debug', message, data); }
}

module.exports = Logger;
