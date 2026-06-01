const fs = require('fs');
const path = require('path');

class PermissionManager {
  constructor(config) {
    this.config = config.permissions;
    this.userLevels = new Map();
  }

  setUserLevel(username, level) {
    this.userLevels.set(username, level);
  }

  getUserLevel(username) {
    return this.userLevels.get(username) || this.config.defaultLevel;
  }

  hasPermission(username, requiredLevel) {
    const commandLevels = this.config.commands;
    const userLevel = this.getUserLevel(username);
    
    if (typeof requiredLevel === 'string') {
      requiredLevel = commandLevels[requiredLevel] || 0;
    }
    
    return userLevel >= requiredLevel;
  }

  isAdmin(username) {
    return this.config.adminUsers.includes(username) || this.getUserLevel(username) >= 2;
  }
}

module.exports = PermissionManager;
