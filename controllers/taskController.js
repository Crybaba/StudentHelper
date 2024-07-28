const db = require('../models');

exports.getTasks = async (chatId, groupId, bot) => {
    try {
        const tasks = await db.Task.findAll({
            where: { groupId: groupId },
        });
        if (tasks.length === 0) {
            bot.sendMessage(chatId, 'В этой группе нет задач.');
        } else {
            const taskList = tasks.map(task => `${task.id}: ${task.title}`).join('\n');
            bot.sendMessage(chatId, `Список задач:\n${taskList}`);
        }
    } catch (error) {
        bot.sendMessage(chatId, 'Произошла ошибка при получении списка задач.');
        console.error(error);
    }
};

exports.createTask = async (chatId, taskData, bot) => {
    try {
        const newTask = await db.Task.create(taskData);
        bot.sendMessage(chatId, `Задача "${newTask.title}" успешно создана и ожидает выполнения.`);
    } catch (error) {
        bot.sendMessage(chatId, 'Произошла ошибка при создании задачи.');
        console.error(error);
    }
};
