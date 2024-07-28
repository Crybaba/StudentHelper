const TelegramBot = require('node-telegram-bot-api');
const token = '7461792381:AAEIKFHDNLwC17s_3bro-oHCT2JCJ1YP-FE'; // Замените на ваш токен бота
const bot = new TelegramBot(token, { polling: true });

const groupController = require('./controllers/groupController');
const taskController = require('./controllers/taskController');
const userController = require('./controllers/userController');

// Хранение состояния пользователей для управления диалогами
const userStates = {};

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    userStates[chatId] = {};
    bot.sendMessage(chatId, 'Привет! Какая группа вам нужна?', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Добавить группу', callback_data: 'add_group' }],
                [{ text: 'Группы, что ожидают добавления', callback_data: 'pending_groups' }]
            ]
        }
    });
});

// Обработка нажатий на кнопки
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;

    if (data === 'add_group') {
        bot.sendMessage(chatId, 'Введите имя группы для добавления:');
        userStates[chatId].state = 'add_group';
    } else if (data === 'pending_groups') {
        await groupController.getPendingGroups(chatId, bot);
    } else if (data.startsWith('group_')) {
        const groupId = data.split('_')[1];
        userStates[chatId].groupId = groupId;
        bot.sendMessage(chatId, 'Выберите действие:', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Задачи', callback_data: `tasks_${groupId}` }],
                    [{ text: 'Добавить задачу', callback_data: `add_task_${groupId}` }],
                    [{ text: 'Назад', callback_data: 'back' }]
                ]
            }
        });
    } else if (data.startsWith('tasks_')) {
        const groupId = data.split('_')[1];
        await taskController.getTasks(chatId, groupId, bot);
    } else if (data.startsWith('add_task_')) {
        const groupId = data.split('_')[1];
        bot.sendMessage(chatId, 'Введите описание задачи:');
        userStates[chatId].state = 'add_task';
        userStates[chatId].groupId = groupId;
    } else if (data === 'back') {
        userStates[chatId] = {};
        bot.sendMessage(chatId, 'Привет! Какая группа вам нужна?', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Добавить группу', callback_data: 'add_group' }],
                    [{ text: 'Группы, что ожидают добавления', callback_data: 'pending_groups' }]
                ]
            }
        });
    }
});

// Обработка текстовых сообщений
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (userStates[chatId]) {
        const state = userStates[chatId].state;
        const groupId = userStates[chatId].groupId;

        if (state === 'add_group') {
            await groupController.createGroup(chatId, text, bot);
            userStates[chatId] = {};
        } else if (state === 'add_task') {
            const taskData = {
                title: text,
                groupId: groupId,
                status: 'pending', // Задача создается в статусе "ожидание"
                // Добавить другие необходимые поля для задачи
            };
            await taskController.createTask(chatId, taskData, bot);
            userStates[chatId] = {};
        }
    }
});

// Администрирование
bot.onText(/\/admin/, (msg) => {
    const chatId = msg.chat.id;
    userStates[chatId] = { role: 'admin' };
    bot.sendMessage(chatId, 'Выберите действие администратора:', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Добавить пользователя', callback_data: 'add_user' }],
                [{ text: 'Удалить пользователя', callback_data: 'delete_user' }],
                [{ text: 'Назначить куратора', callback_data: 'assign_curator' }],
                [{ text: 'Назад', callback_data: 'back' }]
            ]
        }
    });
});

// Кнопки администратора
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (userStates[chatId] && userStates[chatId].role === 'admin') {
        if (data === 'add_user') {
            bot.sendMessage(chatId, 'Введите данные пользователя для добавления:');
            userStates[chatId].state = 'add_user';
        } else if (data === 'delete_user') {
            bot.sendMessage(chatId, 'Введите ID пользователя для удаления:');
            userStates[chatId].state = 'delete_user';
        } else if (data === 'assign_curator') {
            bot.sendMessage(chatId, 'Введите ID пользователя и ID группы для назначения куратором:');
            userStates[chatId].state = 'assign_curator';
        }
    }
});

// Обработка текстовых сообщений для администратора
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (userStates[chatId] && userStates[chatId].role === 'admin') {
        const state = userStates[chatId].state;

        if (state === 'add_user') {
            // Добавляем пользователя (разделить данные, если нужно)
            const userData = { /* данные пользователя */ };
            await userController.addUser(chatId, userData, bot);
            userStates[chatId] = { role: 'admin' };
        } else if (state === 'delete_user') {
            const userId = parseInt(text);
            await userController.deleteUser(chatId, userId, bot);
            userStates[chatId] = { role: 'admin' };
        } else if (state === 'assign_curator') {
            const [userId, groupId] = text.split(' ').map(Number);
            await userController.assignCurator(chatId, userId, groupId, bot);
            userStates[chatId] = { role: 'admin' };
        }
    }
});
