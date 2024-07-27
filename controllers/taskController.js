const db = require('../models');

exports.createTask = async (chatId, taskData) => {
    try {
        const task = await db.Task.create(taskData);
        sendMessage(chatId, `Задача "${task.title}" была успешно создана.`);
    } catch (error) {
        sendMessage(chatId, 'Произошла ошибка при создании задачи.');
        console.error(error);
    }
};

exports.deleteTask = async (chatId, taskId) => {
    try {
        const task = await db.Task.findByPk(taskId);
        if (task) {
            await task.destroy();
            sendMessage(chatId, `Задача с ID ${taskId} была удалена.`);
        } else {
            sendMessage(chatId, `Задача с ID ${taskId} не найдена.`);
        }
    } catch (error) {
        sendMessage(chatId, 'Произошла ошибка при удалении задачи.');
        console.error(error);
    }
};

exports.updateTask = async (chatId, taskId, updatedData) => {
    try {
        const task = await db.Task.findByPk(taskId);
        if (task) {
            await task.update(updatedData);
            sendMessage(chatId, `Задача с ID ${taskId} была успешно обновлена.`);
        } else {
            sendMessage(chatId, `Задача с ID ${taskId} не найдена.`);
        }
    } catch (error) {
        sendMessage(chatId, 'Произошла ошибка при обновлении задачи.');
        console.error(error);
    }
};

exports.completeTask = async (chatId, taskId) => {
    try {
        const task = await db.Task.findByPk(taskId);
        if (task) {
            await task.update({ status: 'completed' });
            sendMessage(chatId, `Задача с ID ${taskId} была помечена как выполненная.`);
        } else {
            sendMessage(chatId, `Задача с ID ${taskId} не найдена.`);
        }
    } catch (error) {
        sendMessage(chatId, 'Произошла ошибка при изменении статуса задачи.');
        console.error(error);
    }
};