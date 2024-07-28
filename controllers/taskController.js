const db = require('../models');

exports.getTasks = async (chatId, groupId, bot) => {
    try {
        const tasks = await db.Task.findAll({
            where: { groupId: groupId },
            order: [['deadline', 'ASC']]
        });
        if (tasks.length === 0) {
            bot.sendMessage(chatId, 'Нет задач для данной группы.');
        } else {
            const taskList = tasks.map(task => `${task.id}: ${task.title} - до ${task.deadline}`).join('\n');
            bot.sendMessage(chatId, `Список задач для группы:\n${taskList}`);
        }
    } catch (error) {
        bot.sendMessage(chatId, 'Произошла ошибка при получении списка задач.');
        console.error(error);
    }
};

exports.createTask = async (chatId, taskData, bot) => {
    try {
        const newTask = await db.Task.create(taskData);
        bot.sendMessage(chatId, `Задача "${newTask.title}" успешно создана.`);
    } catch (error) {
        bot.sendMessage(chatId, 'Произошла ошибка при создании задачи.');
        console.error(error);
    }
};

exports.getPendingTasks = async () => {
    try {
        const tasks = await db.Task.findAll({ where: { status: 'pending' } });
        return tasks;
    } catch (error) {
        console.error('Произошла ошибка при получении списка ожидающих задач:', error);
        return [];
    }
};
