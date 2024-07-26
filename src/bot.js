require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { sequelize, User, Group, Task, Subject, UserGroup } = require('./models');
const logger = require('./logger');

// Создаем экземпляр бота
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const userState = {};

// Функция для отправки сообщения с выбором группы
const askForGroup = async (chatId) => {
    try {
        const groups = await Group.findAll();
        const groupButtons = groups.map(group => ({
            text: group.name,
            callback_data: `group_${group.id}`
        }));

        groupButtons.push({
            text: 'Добавить группу',
            callback_data: 'add_group'
        });

        const options = {
            reply_markup: JSON.stringify({
                inline_keyboard: [groupButtons]
            })
        };

        bot.sendMessage(chatId, 'Выберите вашу группу или добавьте новую:', options);
    } catch (err) {
        logger.error('Error fetching groups: ', err);
        bot.sendMessage(chatId, 'Произошла ошибка при получении списка групп.');
    }
};

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    logger.info(`Received /start command from chat ${chatId}`);
    askForGroup(chatId);
});

// Обработчик callback_query для выбора группы или добавления новой
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    logger.info(`Received callback_query with data: ${data} from chat ${chatId}`);

    if (data.startsWith('group_')) {
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
    } else if (data === 'add_group') {
        bot.sendMessage(chatId, 'Введите название новой группы:');
        userState[chatId] = { action: 'add_group' };
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
            await Group.create({ name: groupName, approved: false });
            bot.sendMessage(chatId, 'Заявка на добавление группы отправлена на рассмотрение.');
        } catch (err) {
            logger.error('Error creating group: ', err);
            bot.sendMessage(chatId, 'Произошла ошибка при добавлении группы.');
        }

        userState[chatId] = null;
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