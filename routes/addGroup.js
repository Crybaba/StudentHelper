const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Add Group route');
});

module.exports = {
    handleAddGroup: (bot, msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, 'Please provide the group name.');
        // Здесь можно добавить логику для добавления группы
    },
    router
};
