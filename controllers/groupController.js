const db = require('../models');

exports.getPendingGroups = async (chatId, bot) => {
    try {
        const pendingGroups = await db.Group.findAll({ where: { status: 'pending' } });
        if (pendingGroups.length === 0) {
            bot.sendMessage(chatId, 'Нет групп, ожидающих подтверждения.');
        } else {
            const groupNames = pendingGroups.map(group => `${group.id}: ${group.name}`).join('\n');
            bot.sendMessage(chatId, `Группы, ожидающие подтверждения:\n${groupNames}`);
        }
    } catch (error) {
        bot.sendMessage(chatId, 'Произошла ошибка при получении списка групп, ожидающих подтверждения.');
        console.error(error);
    }
};

exports.createGroup = async (chatId, groupName, bot) => {
    try {
        const newGroup = await db.Group.create({ name: groupName, status: 'pending' });
        bot.sendMessage(chatId, `Группа "${groupName}" успешно создана и ожидает подтверждения.`);
    } catch (error) {
        bot.sendMessage(chatId, 'Произошла ошибка при создании группы.');
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
