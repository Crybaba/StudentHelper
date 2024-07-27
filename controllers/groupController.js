const db = require('../models');

exports.createGroup = async (chatId, groupName) => {
    try {
        const group = await db.Group.create({ name: groupName });
        // Отправить сообщение в Telegram о создании группы
        sendMessage(chatId, `Заявка на добавление группы "${groupName}" отправлена на рассмотрение.`);
    } catch (error) {
        sendMessage(chatId, 'Произошла ошибка при отправке заявки.');
        console.error(error);
    }
};

exports.getPendingGroups = async (chatId) => {
    try {
        const groups = await db.Group.findAll({ where: { status: 'pending' } });
        const groupList = groups.map(group => group.name).join('\n') || 'Нет ожидающих групп.';
        sendMessage(chatId, `Группы, что ожидают добавление:\n${groupList}`);
    } catch (error) {
        sendMessage(chatId, 'Произошла ошибка при получении групп.');
        console.error(error);
    }
};

exports.getActiveGroups = async (chatId) => {
    try {
        const groups = await db.Group.findAll({ where: { status: 'active' } });
        const options = {
            reply_markup: {
                inline_keyboard: groups.map(group => [{
                    text: group.name,
                    callback_data: `group_${group.id}`
                }])
            }
        };
        sendMessage(chatId, 'Выберите группу:', options);
    } catch (error) {
        sendMessage(chatId, 'Произошла ошибка при получении групп.');
        console.error(error);
    }
};
