const { User } = require('./models');
const logger = require('./services/logger');

// Функция для установки роли пользователя
const setRole = async (chatId, userId, role, bot) => {
    try {
        const user = await User.findByPk(userId);
        if (user) {
            user.role = role;
            await user.save();
            bot.sendMessage(chatId, `Роль пользователя ${user.username} изменена на ${role}.`);
        } else {
            bot.sendMessage(chatId, `Пользователь с ID ${userId} не найден.`);
        }
    } catch (err) {
        logger.error('Error setting role: ', err);
        bot.sendMessage(chatId, 'Произошла ошибка при изменении роли пользователя.');
    }
};

module.exports = {
    setRole
};