const TelegramBot = require('node-telegram-bot-api');
const token = '7461792381:AAEIKFHDNLwC17s_3bro-oHCT2JCJ1YP-FE'; // Замените на ваш токен бота
const bot = new TelegramBot(token, { polling: true });

const groupController = require('./controllers/groupController');
const taskController = require('./controllers/taskController');
const userController = require('./controllers/userController');
const db = require('./models');

// Хранение состояния пользователей для управления диалогами
const userStates = {};

// Обработка команды /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    userStates[chatId] = {};

    // Добавление пользователя в базу данных
    await userController.addUser(telegramId, msg.from);

    const user = await db.User.findOne({ where: { telegram_id: chatId } });
    if (user && user.group_id !== null) {
        const group = await db.Group.findByPk(user.group_id);
        bot.sendMessage(chatId, `Вы выбрали группу "${group.name}"`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Задачи', callback_data: `tasks_${user.id}` }],
                    [{ text: 'Добавить задачу', callback_data: `add_task_${user.id}` }],
                    [{ text: 'Назад', callback_data: 'back' }]
                ]
            }
        });
    } else {
        bot.sendMessage(chatId, 'Привет! Какая группа вам нужна?', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Добавить группу', callback_data: 'add_group' }],
                    [{ text: 'Группы, что ожидают добавления', callback_data: 'pending_groups' }],
                    [{ text: 'Выбрать группу', callback_data: 'select_group_0' }]
                ]
            }
        });
    }
});

// Обработка нажатий на кнопки
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (!userStates[chatId]) {
        userStates[chatId] = {}; // Инициализация состояния пользователя, если его нет
    }

    if (data === 'add_group') {
        bot.sendMessage(chatId, 'Введите имя группы для добавления:');
        userStates[chatId].state = 'add_group';
    } else if (data === 'pending_groups') {
        await groupController.getPendingGroups(chatId, bot);
    } else if (data.startsWith('select_group_')) {
        const page = parseInt(data.split('_')[2]);
        await groupController.showActiveGroups(chatId, bot, page);
    } else if (data.startsWith('choose_group_')) {
        const groupId = parseInt(data.split('_')[2]);
        const user = await db.User.findOne({ where: { telegram_id: chatId } });
        if (user) {
            await user.update({ group_id: groupId });
            const group = await db.Group.findByPk(groupId);
            bot.sendMessage(chatId, `Вы выбрали группу "${group.name}"`, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Задачи', callback_data: `tasks_${user.id}` }],
                        [{ text: 'Добавить задачу', callback_data: `add_task_${user.id}` }],
                        [{ text: 'Назад', callback_data: 'back' }]
                    ]
                }
            });
        }
    } else if (data.startsWith('tasks_')) {
        const userId = data.split('_')[1];
        await taskController.getTasks(chatId, userId, bot);
    } else if (data.startsWith('add_task_')) {
        const userId = data.split('_')[2];
        bot.sendMessage(chatId, 'Введите название задачи:');
        userStates[chatId].state = 'add_task_title';
        userStates[chatId].userId = userId;
    } else if (data === 'complete_task_prompt') {
        bot.sendMessage(chatId, 'Введите ID задачи для завершения:');
        userStates[chatId].state = 'complete_task';
    } else if (data === 'back') {
        const user = await db.User.findOne({ where: { telegram_id: chatId } });
        if (user) {
            await user.update({ group_id: null });
        }
        userStates[chatId] = {};
        bot.sendMessage(chatId, 'Привет! Какая группа вам нужна?', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Добавить группу', callback_data: 'add_group' }],
                    [{ text: 'Группы, что ожидают добавления', callback_data: 'pending_groups' }],
                    [{ text: 'Выбрать группу', callback_data: 'select_group_0' }]
                ]
            }
        });
    }
});

// Обработка текстовых сообщений
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const telegramId = msg.from.id;

    if (userStates[chatId]) {
        const state = userStates[chatId].state;
        const userId = userStates[chatId].userId;

        if (state === 'add_group') {
            await groupController.createGroup(chatId, text, bot);
            userStates[chatId] = {};
        } else if (state === 'add_task_title') {
            userStates[chatId].taskTitle = text;
            bot.sendMessage(chatId, 'Введите описание задачи:');
            userStates[chatId].state = 'add_task_description';
        } else if (state === 'add_task_description') {
            userStates[chatId].taskDescription = text;
            bot.sendMessage(chatId, 'Введите дедлайн задачи (в формате ГГГГ-ММ-ДД):');
            userStates[chatId].state = 'add_task_deadline';
        } else if (state === 'add_task_deadline') {
            const taskTitle = userStates[chatId].taskTitle;
            const taskDescription = userStates[chatId].taskDescription;
            const taskDeadline = text;

            await taskController.createTask(chatId, userId, taskTitle, taskDescription, taskDeadline, bot);
            userStates[chatId] = {};
        } else if (state === 'complete_task') {
            const taskId = parseInt(text);
            await taskController.completeTask(chatId, taskId, bot);
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
        if (data === 'assign_curator') {
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

        if (state === 'assign_curator') {
            const [userId, groupId] = text.split(' ').map(Number);
            await userController.assignCurator(chatId, userId, groupId, bot);
            userStates[chatId] = { role: 'admin' };
        }
    }
});

bot.setMyCommands([
    { command: '/start', description: 'Начало работы с ботом' },
    { command: '/admin', description: 'Режим администратора' },
    { command: '/tasks', description: 'Просмотр задач' },
    { command: '/add_task', description: 'Добавить задачу' },
    { command: '/complete_task', description: 'Завершить задачу' }
]);
