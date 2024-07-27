require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { sequelize, User, Group, Task, Subject, UserGroup } = require('./models');
const logger = require('./services/logger');

// Создаем экземпляр бота
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const userState = {};
const PAGINATION_LIMIT = 5; // Количество групп на одной странице
const messagesCache = {}; // Хранение идентификаторов сообщений для редактирования

// Функция для регистрации пользователя
const registerUser = async (msg) => {
    const telegramId = msg.chat.id;
    const firstName = msg.from.first_name || '';
    const lastName = msg.from.last_name || '';
    const username = msg.from.username || '';
    const name = `${firstName} ${lastName}`.trim() || username || 'NoName';

    const user = await User.findOne({ where: { telegram_id: telegramId } });
    if (!user) {
        await User.create({
            telegram_id: telegramId,
            name,
            role: 'user', // Assuming default role is 'user'
            is_admin: false // Assuming default is not admin
        });
        logger.info(`User ${username} registered with telegramId ${telegramId}`);
    }
};

// Функция для отправки меню выбора группы при старте
const sendGroupSelectionMenu = async (chatId, page = 1, messageId) => {
    try {
        const offset = (page - 1) * PAGINATION_LIMIT;
        const groups = await Group.findAll({
            where: { status: 'active' },
            limit: PAGINATION_LIMIT,
            offset
        });

        const totalGroups = await Group.count({ where: { status: 'active' } });
        const totalPages = Math.ceil(totalGroups / PAGINATION_LIMIT);

        const groupButtons = groups.map(group => ({
            text: group.name,
            callback_data: `group_${group.id}`
        }));

        const options = {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    ...groupButtons.map(button => [button]),
                    [
                        ...(page > 1 ? [{ text: '⬅️ Предыдущая', callback_data: `view_active_groups_${page - 1}` }] : []),
                        ...(page < totalPages ? [{ text: 'Следующая ➡️', callback_data: `view_active_groups_${page + 1}` }] : [])
                    ],
                    [{ text: 'Добавить группу', callback_data: 'add_group' }],
                    [{ text: 'Группы ожидающие одобрения', callback_data: 'view_pending_groups' }]
                ]
            })
        };

        if (messageId) {
            await bot.editMessageText('Выберите активную группу или добавьте новую:', {
                chat_id: chatId,
                message_id: messageId,
                ...options
            });
        } else {
            const sentMessage = await bot.sendMessage(chatId, 'Выберите активную группу или добавьте новую:', options);
            messagesCache[chatId] = sentMessage.message_id; // Сохраняем идентификатор сообщения
        }
    } catch (err) {
        logger.error('Error sending group selection menu: ', err);
        bot.sendMessage(chatId, 'Произошла ошибка при отображении меню выбора группы.');
    }
};

// Функция для отправки списка групп, ожидающих одобрения
const sendPendingGroups = async (chatId) => {
    try {
        const pendingGroups = await Group.findAll({ where: { status: 'pending' } });

        if (pendingGroups.length === 0) {
            bot.sendMessage(chatId, 'Нет групп, ожидающих одобрения.');
            return;
        }

        const pendingGroupsText = pendingGroups.map(group => group.name).join('\n');
        bot.sendMessage(chatId, `Группы, ожидающие одобрения:\n${pendingGroupsText}`);
    } catch (err) {
        logger.error('Error fetching pending groups: ', err);
        bot.sendMessage(chatId, 'Произошла ошибка при получении списка групп, ожидающих одобрения.');
    }
};

// Обработчик команды /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    await registerUser(msg);
    logger.info(`Received /start command from chat ${chatId}`);
    sendGroupSelectionMenu(chatId);
});

// Обработчик callback_query для обработки действий пользователя
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    logger.info(`Received callback_query with data: ${data} from chat ${chatId}`);

    if (data.startsWith('view_active_groups_')) {
        const page = parseInt(data.split('_')[3], 10);
        const messageId = messagesCache[chatId]; // Получаем идентификатор сообщения для редактирования
        await sendGroupSelectionMenu(chatId, page, messageId);
    } else if (data === 'add_group') {
        bot.sendMessage(chatId, 'Введите название новой группы:');
        userState[chatId] = { action: 'add_group' };
    } else if (data === 'view_pending_groups') {
        await sendPendingGroups(chatId);
    } else if (data.startsWith('group_')) {
        const groupId = data.split('_')[1];
        userState[chatId] = { groupId };

        bot.sendMessage(chatId, 'Группа выбрана. Выберите действие:', {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{ text: 'Задачи', callback_data: 'tasks' }],
                    [{ text: 'Добавить задачу', callback_data: 'add_task' }]
                ]
            })
        });
    }
});

// Обработчик текстовых сообщений для добавления группы
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const state = userState[chatId];

    logger.info(`Received message: ${msg.text} from chat ${chatId}`);

    if (state && state.action === 'add_group') {
        const groupName = msg.text;

        try {
            await Group.create({ name: groupName, status: 'pending' });
            bot.sendMessage(chatId, 'Заявка на добавление группы отправлена на рассмотрение.');
        } catch (err) {
            logger.error('Error creating group: ', err);
            bot.sendMessage(chatId, 'Произошла ошибка при добавлении группы.');
        }

        userState[chatId] = null;
        const messageId = messagesCache[chatId];
        sendGroupSelectionMenu(chatId, 1, messageId); // Возвращаем пользователя к выбору группы
    }
});

// Обработчик для кнопки "Задачи"
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    logger.info(`Received callback_query with data: ${data} from chat ${chatId}`);

    if (data === 'tasks') {
        const groupId = userState[chatId].groupId;

        try {
            const tasks = await Task.findAll({
                where: { groupId },
                order: [['deadline', 'ASC']]
            });

            if (tasks.length === 0) {
                bot.sendMessage(chatId, 'В этой группе пока нет задач.');
            } else {
                const taskList = tasks.map(task => `${task.title} - ${task.deadline}`).join('\n');
                bot.sendMessage(chatId, `Список задач:\n${taskList}`);
            }
        } catch (err) {
            logger.error('Error fetching tasks: ', err);
            bot.sendMessage(chatId, 'Произошла ошибка при получении списка задач.');
        }
    } else if (data === 'add_task') {
        bot.sendMessage(chatId, 'Введите название задачи:');
        userState[chatId].action = 'add_task_title';
    }
});

// Обработчик для добавления задачи
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const state = userState[chatId];

    logger.info(`Received message: ${msg.text} from chat ${chatId}`);

    if (state && state.action === 'add_task_title') {
        userState[chatId].taskTitle = msg.text;
        bot.sendMessage(chatId, 'Введите дедлайн задачи (в формате YYYY-MM-DD):');
        state.action = 'add_task_deadline';
    } else if (state && state.action === 'add_task_deadline') {
        userState[chatId].taskDeadline = msg.text;
        bot.sendMessage(chatId, 'Введите описание задачи:');
        state.action = 'add_task_description';
    } else if (state && state.action === 'add_task_description') {
        const taskTitle = state.taskTitle;
        const taskDeadline = state.taskDeadline;
        const taskDescription = msg.text;
        const groupId = state.groupId;
        const creatorId = msg.from.id;

        try {
            await Task.create({
                title: taskTitle,
                deadline: taskDeadline,
                description: taskDescription,
                groupId,
                creator_id: creatorId
            });
            bot.sendMessage(chatId, 'Задача успешно добавлена.');
        } catch (err) {
            logger.error('Error creating task: ', err);
            bot.sendMessage(chatId, 'Произошла ошибка при добавлении задачи.');
        }

        userState[chatId] = null;
    }
});

// Запуск сервера
sequelize.sync({ alter: true }).then(() => {
    logger.info('Database synchronized');
    bot.on('polling_error', (err) => logger.error(err));
}).catch(err => {
    logger.error('Unable to synchronize the database:', err);
});