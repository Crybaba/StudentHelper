const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Add Personal Task route');
});

module.exports = {
    handleAddPersonalTask: (bot, msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, 'Please provide the task details.');
        // Здесь можно добавить логику для добавления персональной задачи
    },
    router
};
