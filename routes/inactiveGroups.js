const express = require('express');
const router = express.Router();
const { getPendingGroups } = require('../controllers/groupController');

const handleGetInactiveGroups = async (bot, msg) => {
    const chatId = msg.chat.id;
    const result = await getPendingGroups();

    if (result.success) {
        const groupList = result.groups.map(group => `ID: ${group.id}, Name: ${group.name}`).join('\n');
        bot.sendMessage(chatId, `Список групп, ожидающих подтверждения:\n${groupList}`);
    } else {
        bot.sendMessage(chatId, 'Произошла ошибка при получении списка групп.');
    }
};

router.get('/', (req, res) => {
    res.send('Inactive groups route is working');
});

module.exports = { router, handleGetInactiveGroups };
