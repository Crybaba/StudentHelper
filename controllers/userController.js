const db = require('../models');

exports.addUser = async (chatId, user) => {
    try {
        await db.User.findOrCreate({
            where: { telegram_id: user.id },
            defaults: {
                telegram_id: user.id,
                name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
                role: 'student'
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
    }
};

exports.assignCurator = async (chatId, userId, groupId, bot) => {
    try {
        const user = await db.User.findByPk(userId);
        const group = await db.Group.findByPk(groupId);

        if (user && group) {
            user.group_id = groupId;
            user.role = 'curator';
            await user.save();
            bot.sendMessage(chatId, `Пользователь с ID: ${userId} назначен куратором группы с ID: ${groupId}.`);
        } else {
            bot.sendMessage(chatId, 'Некорректный ID пользователя или группы.');
        }
    } catch (error) {
        bot.sendMessage(chatId, 'Произошла ошибка при назначении куратора.');
        console.error(error);
    }
};
