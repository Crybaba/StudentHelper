const db = require('../models');

exports.createTask = async (taskData) => {
    try {
        const task = await db.Task.create(taskData);
        return { success: true, message: 'Задача успешно создана.', task };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Произошла ошибка при создании задачи.' };
    }
};

exports.deleteTask = async (taskId) => {
    try {
        const task = await db.Task.findByPk(taskId);
        if (task) {
            await task.destroy();
            return { success: true, message: `Задача с ID ${taskId} была удалена.` };
        } else {
            return { success: false, message: `Задача с ID ${taskId} не найдена.` };
        }
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Произошла ошибка при удалении задачи.' };
    }
};

exports.updateTask = async (taskId, updatedData) => {
    try {
        const task = await db.Task.findByPk(taskId);
        if (task) {
            await task.update(updatedData);
            return { success: true, message: `Задача с ID ${taskId} была обновлена.`, task };
        } else {
            return { success: false, message: `Задача с ID ${taskId} не найдена.` };
        }
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Произошла ошибка при обновлении задачи.' };
    }
};

exports.completeTask = async (taskId) => {
    try {
        const task = await db.Task.findByPk(taskId);
        if (task) {
            await task.update({ status: 'completed' });
            return { success: true, message: `Задача с ID ${taskId} была отмечена как выполненная.`, task };
        } else {
            return { success: false, message: `Задача с ID ${taskId} не найдена.` };
        }
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Произошла ошибка при выполнении задачи.' };
    }
};