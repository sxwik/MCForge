const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

class DashboardServer {
  constructor(bot, logger, config) {
    this.bot = bot;
    this.logger = logger;
    this.config = config;
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketIo(this.server, {
      cors: { origin: '*', methods: ['GET', 'POST'] }
    });
    this.setupRoutes();
    this.setupWebSocket();
  }

  setupRoutes() {
    this.app.use(express.static(path.join(__dirname, '../../public')));
    this.app.use(express.json());

    this.app.get('/api/status', (req, res) => {
      res.json(this.bot.getStatus());
    });

    this.app.get('/api/inventory', (req, res) => {
      const inventory = this.bot.inventoryManager.getInventory();
      res.json(inventory);
    });

    this.app.get('/api/memory', (req, res) => {
      res.json({
        home: this.bot.memoryManager.getHome(),
        storage: this.bot.memoryManager.getStorage(),
        mines: this.bot.memoryManager.getMines(),
        waypoints: this.bot.memoryManager.memory.waypoints
      });
    });

    this.app.get('/api/bots', (req, res) => {
      res.json(this.bot.multiBotManager.listBots());
    });

    this.app.post('/api/command', (req, res) => {
      const { command } = req.body;
      if (!command) {
        return res.status(400).json({ error: 'Command required' });
      }

      this.bot.commandHandler.execute('api', command)
        .then(result => res.json({ success: result }))
        .catch(err => res.status(500).json({ error: err.message }));
    });

    this.app.post('/api/ai-command', (req, res) => {
      const { command } = req.body;
      if (!command) {
        return res.status(400).json({ error: 'Command required' });
      }

      const parsed = this.bot.aiInterpreter.parseCommand(command);
      if (parsed) {
        this.bot.aiInterpreter.executeCommand(parsed)
          .then(() => res.json({ success: true, command: parsed }))
          .catch(err => res.status(500).json({ error: err.message }));
      } else {
        res.status(400).json({ error: 'Command not understood' });
      }
    });

    this.app.get('/api/tasks', (req, res) => {
      res.json(this.bot.taskQueue.getStatus());
    });

    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../../public/index.html'));
    });
  }

  setupWebSocket() {
    this.io.on('connection', (socket) => {
      this.logger.debug('Dashboard client connected');

      socket.on('disconnect', () => {
        this.logger.debug('Dashboard client disconnected');
      });

      socket.on('command', (data) => {
        const { command } = data;
        if (command) {
          this.bot.commandHandler.execute('dashboard', command)
            .catch(err => this.logger.error('Command error', { error: err.message }));
        }
      });

      socket.on('ai-command', (data) => {
        const { command } = data;
        if (command) {
          const parsed = this.bot.aiInterpreter.parseCommand(command);
          if (parsed) {
            this.bot.aiInterpreter.executeCommand(parsed);
          }
        }
      });
    });

    setInterval(() => {
      const status = this.bot.getStatus();
      this.io.emit('status', status);
    }, this.config.dashboard.updateInterval);

    this.bot.bot.on('chat', (username, message) => {
      this.io.emit('chat', { username, message, timestamp: Date.now() });
    });
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server.listen(this.config.dashboard.port, this.config.dashboard.host, () => {
        this.logger.info(`Dashboard running on http://localhost:${this.config.dashboard.port}`);
        resolve();
      }).on('error', reject);
    });
  }

  stop() {
    return new Promise((resolve) => {
      this.server.close(resolve);
    });
  }
}

module.exports = DashboardServer;
