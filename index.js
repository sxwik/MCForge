const MinecraftBot = require('./src/bot');
const DashboardServer = require('./src/dashboard/dashboardServer');

class MinecraftBotPlatform {
  constructor() {
    this.bot = null;
    this.dashboard = null;
  }

  async start() {
    try {
      // Start the bot
      this.bot = new MinecraftBot();
      await this.bot.start();

      // Start the dashboard
      this.dashboard = new DashboardServer(this.bot, this.bot.logger, this.bot.config);
      await this.dashboard.start();

      console.log('✅ Minecraft Bot Platform started successfully');
      console.log(`🌐 Dashboard available at http://localhost:${this.bot.config.dashboard.port}`);
    } catch (err) {
      console.error('❌ Failed to start platform:', err);
      process.exit(1);
    }
  }

  async stop() {
    console.log('Shutting down...');
    if (this.bot) this.bot.stop();
    if (this.dashboard) await this.dashboard.stop();
    process.exit(0);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, shutting down...');
  if (platform) await platform.stop();
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, shutting down...');
  if (platform) await platform.stop();
});

// Start the platform
const platform = new MinecraftBotPlatform();
platform.start().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

module.exports = MinecraftBotPlatform;
