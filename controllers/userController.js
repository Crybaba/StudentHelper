const db = require('../models');

exports.addUser = async (chatId, userData, bot) => {
    try {
        const newUser = await db.User.create(userData);
        bot.sendMessage(chatId, `Пользователь "${newUser.username}" успешно добавлен.`);
    } catch (error) {
        bot.sendMessage(chatId, 'Произошла ошибка при добавлении пользователя.');
        console.error(error);
    }
};

exports.deleteUser = async (chatId, userId, bot) => {
    try {
        const user = await db.User.findByPk(userId);
        if (user) {
            await user.destroy();
            bot.sendMessage(chatId, `Пользователь с ID ${userId} успешно удален.`);
        } else {
            bot.sendMessage(chatId, `Пользователь с ID ${userId} не найден.`);
        }
    } catch (error) {
        bot.sendMessage(chatId, 'Произошла ошибка при удалении пользователя.');
        console.error(error);
    }
};

exports.assignCurator = async (chatId, userId, groupId, bot) => {
    try {
        const user = await db.User.findByPk(userId);
        if (user) {
            user.role = 'curator';
            user.groupId = groupId;
            await user.save();
            bot.sendMessage(chatId, `Пользователь с ID ${userId} назначен куратором группы с ID ${groupId}.`);
        } else {
            bot.sendMessage(chatId, `Пользователь с ID ${userId} не найден.`);
        }
    } catch (error) {
        bot.sendMessage(chatId, 'Произошла ошибка при назначении куратора.');
        console.error(error);
    }
};
