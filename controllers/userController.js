const db = require('../models');

exports.createUser = async (chatId, userData) => {
    try {
        const user = await db.User.create(userData);
        sendMessage(chatId, `Пользователь "${user.name}" был успешно создан.`);
    } catch (error) {
        sendMessage(chatId, 'Произошла ошибка при создании пользователя.');
        console.error(error);
    }
};

exports.updateUser = async (chatId, userId, updatedData) => {
    try {
        const user = await db.User.findByPk(userId);
        if (user) {
            await user.update(updatedData);
            sendMessage(chatId, `Пользователь с ID ${userId} был успешно обновлён.`);
        } else {
            sendMessage(chatId, `Пользователь с ID ${userId} не найден.`);
        }
    } catch (error) {
        sendMessage(chatId, 'Произошла ошибка при обновлении пользователя.');
        console.error(error);
    }
};

exports.deleteUser = async (chatId, userId) => {
    try {
        const user = await db.User.findByPk(userId);
        if (user) {
            await user.destroy();
            sendMessage(chatId, `Пользователь с ID ${userId} был удалён.`);
        } else {
            sendMessage(chatId, `Пользователь с ID ${userId} не найден.`);
        }
    } catch (error) {
        sendMessage(chatId, 'Произошла ошибка при удалении пользователя.');
        console.error(error);
    }
};

exports.promoteToCurator = async (chatId, userId) => {
    try {
        const user = await db.User.findByPk(userId);
        if (user) {
            await user.update({ role: 'curator' });
            sendMessage(chatId, `Пользователь с ID ${userId} был повышен до куратора.`);
        } else {
            sendMessage(chatId, `Пользователь с ID ${userId} не найден.`);
        }
    } catch (error) {
        sendMessage(chatId, 'Произошла ошибка при повышении пользователя.');
        console.error(error);
    }
};