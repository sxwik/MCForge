const fs = require('fs');
const path = require('path');

class MemoryManager {
  constructor(config) {
    this.config = config.memory;
    this.memory = {
      home: null,
      storage: null,
      mines: [],
      waypoints: {},
      visited: [],
      mobs: [],
      deaths: []
    };
    this.persistPath = this.config.persistPath;
    
    const dir = path.dirname(this.persistPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    this.load();
    
    if (this.config.autoSave) {
      this.saveInterval = setInterval(() => this.save(), this.config.saveInterval);
    }
  }

  load() {
    try {
      if (fs.existsSync(this.persistPath)) {
        const data = fs.readFileSync(this.persistPath, 'utf8');
        this.memory = JSON.parse(data);
      }
    } catch (err) {
      console.error('Failed to load memory:', err);
    }
  }

  save() {
    try {
      fs.writeFileSync(this.persistPath, JSON.stringify(this.memory, null, 2));
    } catch (err) {
      console.error('Failed to save memory:', err);
    }
  }

  setHome(pos) {
    this.memory.home = { x: Math.floor(pos.x), y: Math.floor(pos.y), z: Math.floor(pos.z) };
  }

  getHome() {
    return this.memory.home;
  }

  setStorage(pos) {
    this.memory.storage = { x: Math.floor(pos.x), y: Math.floor(pos.y), z: Math.floor(pos.z) };
  }

  getStorage() {
    return this.memory.storage;
  }

  addMine(name, pos) {
    this.memory.mines.push({ name, x: Math.floor(pos.x), y: Math.floor(pos.y), z: Math.floor(pos.z) });
  }

  getMines() {
    return this.memory.mines;
  }

  addWaypoint(name, pos) {
    this.memory.waypoints[name] = { x: Math.floor(pos.x), y: Math.floor(pos.y), z: Math.floor(pos.z) };
  }

  getWaypoint(name) {
    return this.memory.waypoints[name];
  }

  recordDeath(pos) {
    this.memory.deaths.push({ x: Math.floor(pos.x), y: Math.floor(pos.y), z: Math.floor(pos.z), time: Date.now() });
  }

  getLastDeathLocation() {
    return this.memory.deaths[this.memory.deaths.length - 1] || null;
  }

  recordMobSighting(type, pos) {
    this.memory.mobs.push({ type, x: pos.x, y: pos.y, z: pos.z, time: Date.now() });
    if (this.memory.mobs.length > 100) {
      this.memory.mobs.shift();
    }
  }

  destroy() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }
    this.save();
  }
}

module.exports = MemoryManager;
