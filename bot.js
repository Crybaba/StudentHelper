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
        const buttons = [
            [{ text: 'Задачи', callback_data: `tasks_${user.id}` }],
            [{ text: 'Добавить задачу', callback_data: `add_task_${user.id}` }],
            [{ text: 'Назад', callback_data: 'back' }]
        ];

        if (user.role === 'admin') {
            buttons.unshift([{ text: 'Добавить группу', callback_data: 'add_group_admin' }]);
        }

        bot.sendMessage(chatId, `Вы выбрали группу "${group.name}"`, {
            reply_markup: {
                inline_keyboard: buttons
            }
        });
    } else {
        const buttons = [
            [{ text: 'Добавить группу', callback_data: 'add_group' }],
            [{ text: 'Группы, что ожидают добавления', callback_data: 'pending_groups' }],
            [{ text: 'Выбрать группу', callback_data: 'select_group_0' }]
        ];

        bot.sendMessage(chatId, 'Привет! Какая группа вам нужна?', {
            reply_markup: {
                inline_keyboard: buttons
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
    } else if (data === 'add_group_admin') {
        const user = await db.User.findOne({ where: { telegram_id: chatId } });
        if (user && user.role === 'admin') {
            bot.sendMessage(chatId, 'Введите ID группы для активации:');
            userStates[chatId].state = 'activate_group';
        } else {
            bot.sendMessage(chatId, 'Ошибка доступа. Вы не администратор.');
        }
    } else if (data.startsWith('select_group_')) {
        const page = parseInt(data.split('_')[2]);
        await groupController.showActiveGroups(chatId, bot, page);
    } else if (data.startsWith('choose_group_')) {
        const groupId = parseInt(data.split('_')[2]);
        const user = await db.User.findOne({ where: { telegram_id: chatId } });
        if (user) {
            await user.update({ group_id: groupId });
            const group = await db.Group.findByPk(groupId);
            const buttons = [
                [{ text: 'Задачи', callback_data: `tasks_${user.id}` }],
                [{ text: 'Добавить задачу', callback_data: `add_task_${user.id}` }],
                [{ text: 'Назад', callback_data: 'back' }]
            ];

            if (user.role === 'admin') {
                buttons.unshift([{ text: 'Добавить группу', callback_data: 'add_group_admin' }]);
            }

            bot.sendMessage(chatId, `Вы выбрали группу "${group.name}"`, {
                reply_markup: {
                    inline_keyboard: buttons
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
        const buttons = [
            [{ text: 'Добавить группу', callback_data: 'add_group' }],
            [{ text: 'Группы, что ожидают добавления', callback_data: 'pending_groups' }],
            [{ text: 'Выбрать группу', callback_data: 'select_group_0' }]
        ];

        bot.sendMessage(chatId, 'Привет! Какая группа вам нужна?', {
            reply_markup: {
                inline_keyboard: buttons
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
            bot.sendMessage(chatId, 'Введите дату завершения задачи в формате ГГГГ-ММ-ДД:');
            userStates[chatId].state = 'add_task_due_date';
        } else if (state === 'add_task_due_date') {
            await taskController.addTask(chatId, userId, userStates[chatId].taskTitle, userStates[chatId].taskDescription, text, bot);
            userStates[chatId] = {};
        } else if (state === 'complete_task') {
            await taskController.completeTask(chatId, parseInt(text), bot);
            userStates[chatId] = {};
        } else if (state === 'activate_group') {
            const groupId = parseInt(text);
            await groupController.activateGroup(chatId, groupId, bot);
            userStates[chatId] = {};
        } else if (state === 'assign_curator') {
            if (userStates[chatId].curatorStep === 'user_id') {
                const input = text.trim();
                let user;
                if (input.startsWith('@')) {
                    const username = input.substring(1);
                    user = await db.User.findOne({ where: { username: username } });
                } else {
                    const inputTelegramId = parseInt(input);
                    user = await db.User.findOne({ where: { telegram_id: inputTelegramId } });
                }

                if (user) {
                    userStates[chatId].curatorUserId = user.id;
                    bot.sendMessage(chatId, 'Введите ID группы для назначения куратора:');
                    userStates[chatId].curatorStep = 'group_id';
                } else {
                    bot.sendMessage(chatId, 'Пользователь не найден. Попробуйте еще раз:');
                }
            } else if (userStates[chatId].curatorStep === 'group_id') {
                const groupId = parseInt(text);
                const user = await db.User.findByPk(userStates[chatId].curatorUserId);
                if (user && user.group_id !== null) {
                    await user.update({ role: 'curator', group_id: groupId });
                    bot.sendMessage(chatId, `Пользователь @${user.username} назначен куратором группы с ID ${groupId}.`);
                    userStates[chatId] = {};
                } else {
                    bot.sendMessage(chatId, 'Группа не найдена или пользователь не привязан к группе. Попробуйте еще раз.');
                }
            }
        }
    }
});

// Команда для режима администратора
bot.onText(/\/admin/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;

    const user = await db.User.findOne({ where: { telegram_id: telegramId } });
    if (user && user.role === 'admin') {
        userStates[chatId] = { role: 'admin' };
        bot.sendMessage(chatId, 'Выберите действие администратора:', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Назначить куратора', callback_data: 'assign_curator' }],
                    [{ text: 'Активировать группу', callback_data: 'add_group_admin' }],
                    [{ text: 'Назад', callback_data: 'back' }]
                ]
            }
        });
    } else {
        bot.sendMessage(chatId, 'Ошибка доступа. Вы не администратор.');
    }
});

// Кнопки администратора
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (userStates[chatId] && userStates[chatId].role === 'admin') {
        if (data === 'assign_curator') {
            bot.sendMessage(chatId, 'Введите @username пользователя для назначения куратором:');
            userStates[chatId].state = 'assign_curator';
            userStates[chatId].curatorStep = 'user_id';
        } else if (data === 'add_group_admin') {
            bot.sendMessage(chatId, 'Введите ID группы для активации:');
            userStates[chatId].state = 'activate_group';
        }
    }
});

// Установка команд бота
bot.setMyCommands([
    { command: '/start', description: 'Начало работы с ботом' },
    { command: '/admin', description: 'Режим администратора' }
]);
