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
    // Проверяем, чтобы значение page не было меньше 0
    if (page < 0) {
        page = 0;
    }
    const offset = page * limit;

    try {
        const groups = await db.Group.findAll({
            where: { status: 'active' },
            limit: limit,
            offset: offset
        });

        if (groups.length === 0) {
            bot.sendMessage(chatId, 'Нет активных групп.');
        } else {
            const groupButtons = groups.map(group => [
                { text: group.name, callback_data: `choose_group_${group.id}` }
            ]);

            // Добавляем кнопки для пагинации
            const paginationButtons = [];
            if (page > 0) {
                paginationButtons.push({ text: 'Назад', callback_data: `select_group_${page - 1}` });
            }
            if (groups.length === limit) {
                paginationButtons.push({ text: 'Вперед', callback_data: `select_group_${page + 1}` });
            }
            if (paginationButtons.length > 0) {
                groupButtons.push(paginationButtons);
            }

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

exports.activateGroup = async (chatId, groupId, bot) => {
    try {
        const group = await db.Group.findByPk(groupId);
        if (!group) {
            bot.sendMessage(chatId, 'Группа не найдена.');
            return;
        }

        if (group.status !== 'pending') {
            bot.sendMessage(chatId, 'Группа не находится в статусе ожидания.');
            return;
        }

        await group.update({ status: 'active' });
        bot.sendMessage(chatId, `Группа с ID: ${groupId} активирована.`);
    } catch (error) {
        bot.sendMessage(chatId, 'Произошла ошибка при активации группы.');
        console.error(error);
    }
};
