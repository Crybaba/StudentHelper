const express = require('express');
const router = express.Router();
const { createGroup } = require('../controllers/groupController');

const handleAddGroup = async (bot, msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Пожалуйста, введите название группы:');
    bot.once('message', async (msg) => {
        const groupName = msg.text;
        const result = await createGroup(groupName);

        if (result.success) {
            bot.sendMessage(chatId, `Заявка на добавление группы "${groupName}" отправлена на рассмотрение.`);
        } else {
            bot.sendMessage(chatId, 'Произошла ошибка при отправке заявки.');
        }
    });
};

router.get('/', (req, res) => {
    res.send('Add group route is working');
});

module.exports = { router, handleAddGroup };
