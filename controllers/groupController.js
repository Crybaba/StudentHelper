const db = require('../models');

exports.getPendingGroups = async (chatId, bot) => {
    try {
        const groups = await db.Group.findAll({
            where: { status: 'pending' },
        });
        if (groups.length === 0) {
            bot.sendMessage(chatId, 'Нет групп, ожидающих добавления.');
        } else {
            const groupList = groups.map(group => `${group.id}: ${group.name}`).join('\n');
            bot.sendMessage(chatId, `Список групп, ожидающих добавления:\n${groupList}`);
        }
    } catch (error) {
        bot.sendMessage(chatId, 'Произошла ошибка при получении списка групп, ожидающих добавления.');
        console.error(error);
    }
};

exports.createGroup = async (chatId, groupName, bot) => {
    try {
        const newGroup = await db.Group.create({ name: groupName, status: 'pending' });
        bot.sendMessage(chatId, `Группа "${newGroup.name}" успешно создана и ожидает подтверждения.`);
    } catch (error) {
        bot.sendMessage(chatId, 'Произошла ошибка при создании группы.');
        console.error(error);
    }
};

exports.showActiveGroups = async (chatId, bot, page = 0) => {
    const limit = 5;
    try {
        const groups = await db.Group.findAll({
            where: { status: 'active' },
            limit: limit,
            offset: page * limit
        });
        if (groups.length === 0) {
            bot.sendMessage(chatId, 'Нет активных групп.');
        } else {
            const groupButtons = groups.map(group => [
                { text: group.name, callback_data: `choose_group_${group.id}` }
            ]);
            groupButtons.push([
                { text: 'Назад', callback_data: `select_group_${page - 1}` },
                { text: 'Вперед', callback_data: `select_group_${page + 1}` }
            ]);
            bot.sendMessage(chatId, 'Выберите группу:', {
                reply_markup: {
                    inline_keyboard: groupButtons
                }
            });
        }
    } catch (error) {
        bot.sendMessage(chatId, 'Произошла ошибка при получении списка активных групп.');
        console.error(error);
    }
};
