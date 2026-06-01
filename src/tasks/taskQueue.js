class Task {
  constructor(id, type, data) {
    this.id = id;
    this.type = type;
    this.data = data;
    this.status = 'pending';
    this.priority = 0;
    this.createdAt = Date.now();
    this.startedAt = null;
    this.completedAt = null;
    this.error = null;
  }
}

class TaskQueue {
  constructor(bot, logger) {
    this.bot = bot;
    this.logger = logger;
    this.queue = [];
    this.currentTask = null;
    this.isRunning = false;
    this.taskHandlers = new Map();
  }

  registerHandler(type, handler) {
    this.taskHandlers.set(type, handler);
  }

  addTask(id, type, data, priority = 0) {
    const task = new Task(id, type, data);
    task.priority = priority;

    const insertIndex = this.queue.findIndex(t => t.priority < priority);
    if (insertIndex === -1) {
      this.queue.push(task);
    } else {
      this.queue.splice(insertIndex, 0, task);
    }

    this.logger.info(`Task added: ${type}`, { id, priority });
    return task;
  }

  removeTask(id) {
    const index = this.queue.findIndex(t => t.id === id);
    if (index !== -1) {
      this.queue.splice(index, 1);
      return true;
    }
    return false;
  }

  pauseTask() {
    if (this.currentTask) {
      this.currentTask.status = 'paused';
      this.isRunning = false;
      this.logger.info(`Task paused: ${this.currentTask.id}`);
    }
  }

  resumeTask() {
    if (this.currentTask && this.currentTask.status === 'paused') {
      this.currentTask.status = 'running';
      this.isRunning = true;
      this.logger.info(`Task resumed: ${this.currentTask.id}`);
      this.process();
    }
  }

  cancelTask(id) {
    if (this.currentTask && this.currentTask.id === id) {
      this.currentTask.status = 'cancelled';
      this.currentTask = null;
      this.isRunning = false;
      this.logger.info(`Task cancelled: ${id}`);
      this.process();
      return true;
    }
    return this.removeTask(id);
  }

  async process() {
    if (this.isRunning || this.queue.length === 0) return;

    this.currentTask = this.queue.shift();
    this.currentTask.status = 'running';
    this.currentTask.startedAt = Date.now();
    this.isRunning = true;

    this.logger.info(`Task started: ${this.currentTask.type}`, { id: this.currentTask.id });

    try {
      const handler = this.taskHandlers.get(this.currentTask.type);
      if (!handler) {
        throw new Error(`No handler for task type: ${this.currentTask.type}`);
      }

      await handler(this.currentTask, this.bot);

      this.currentTask.status = 'completed';
      this.currentTask.completedAt = Date.now();
      this.logger.info(`Task completed: ${this.currentTask.id}`);
    } catch (err) {
      this.currentTask.status = 'failed';
      this.currentTask.error = err.message;
      this.logger.error(`Task failed: ${this.currentTask.id}`, { error: err.message });
    }

    this.isRunning = false;
    setImmediate(() => this.process());
  }

  start() {
    this.logger.info('Task queue started');
    this.process();
  }

  stop() {
    this.isRunning = false;
    this.logger.info('Task queue stopped');
  }

  getStatus() {
    return {
      currentTask: this.currentTask,
      queue: this.queue,
      isRunning: this.isRunning
    };
  }
}

module.exports = { Task, TaskQueue };
