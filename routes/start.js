const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Start route');
});

module.exports = {
    handleStart: (bot, msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, 'Welcome to the bot!');
    },
    router
};
