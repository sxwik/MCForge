const mineflayer = require('mineflayer');

const bot = mineflayer.createBot({
    host: 'Bottest-d7bF.aternos.me',
    port: 28572,
    username: 'TickelBot',
    auth: 'offline'
});

bot.once('spawn', () => {
    console.log('Bot joined the server!');
});

bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    if (message === '!jump') {
        bot.setControlState('jump', true);
        setTimeout(() => {
            bot.setControlState('jump', false);
        }, 500);
    }

    if (message === '!hello') {
        bot.chat(`Hello ${username}!`);
    }
});

bot.on('kicked', console.log);
bot.on('error', console.log);