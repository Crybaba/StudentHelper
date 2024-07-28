const express = require('express');
const router = express.Router();
const bot = require('../bot'); // Импортируем бота
const addGroupRoute = require('./addGroup');
const inactiveGroupsRoute = require('./inactiveGroups');

const handleStart = (bot, msg) => {
    const chatId = msg.chat.id;
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Добавить группу', callback_data: 'add_group' },
                    { text: 'Группы, что ожидают добавление', callback_data: 'pending_groups' }
                ]
            ]
        }
    };
    bot.sendMessage(chatId, 'Выберите действие:', options);
};

router.get('/', (req, res) => {
    res.send('Start route is working');
});

bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const action = callbackQuery.data;

    switch (action) {
        case 'add_group':
            await addGroupRoute.handleAddGroup(bot, { chat: { id: chatId } });
            handleStart(bot, { chat: { id: chatId } }); // Запускаем start снова
            break;

        case 'pending_groups':
            await inactiveGroupsRoute.handleGetInactiveGroups(bot, { chat: { id: chatId } });
            handleStart(bot, { chat: { id: chatId } }); // Запускаем start снова
            break;

        default:
            bot.sendMessage(chatId, 'Неизвестное действие.');
    }

    bot.answerCallbackQuery(callbackQuery.id);
});

module.exports = { router, handleStart };
