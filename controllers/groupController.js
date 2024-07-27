const db = require('../models');

exports.createGroup = async (chatId, groupName) => {
    try {
        const group = await db.Group.create({ name: groupName });
        sendMessage(chatId, `Заявка на добавление группы "${groupName}" отправлена на рассмотрение.`);
    } catch (error) {
        sendMessage(chatId, 'Произошла ошибка при отправке заявки.');
        console.error(error);
    }
};

exports.deleteGroup = async (chatId, groupId) => {
    try {
        const group = await db.Group.findByPk(groupId);
        if (group) {
            await group.destroy();
            sendMessage(chatId, `Группа с ID ${groupId} была удалена.`);
        } else {
            sendMessage(chatId, `Группа с ID ${groupId} не найдена.`);
        }
    } catch (error) {
        sendMessage(chatId, 'Произошла ошибка при удалении группы.');
        console.error(error);
    }
};

exports.getGroups = async (chatId) => {
    try {
        const groups = await db.Group.findAll();
        if (groups.length > 0) {
            const groupList = groups.map(group => `ID: ${group.id}, Name: ${group.name}, Status: ${group.status}`).join('\n');
            sendMessage(chatId, `Список всех групп:\n${groupList}`);
        } else {
            sendMessage(chatId, 'Список групп пуст.');
        }
    } catch (error) {
        sendMessage(chatId, 'Произошла ошибка при получении списка групп.');
        console.error(error);
    }
};

exports.getActiveGroups = async (chatId) => {
    try {
        const groups = await db.Group.findAll({ where: { status: 'active' } });
        if (groups.length > 0) {
            const groupList = groups.map(group => `ID: ${group.id}, Name: ${group.name}`).join('\n');
            sendMessage(chatId, `Список активных групп:\n${groupList}`);
        } else {
            sendMessage(chatId, 'Список активных групп пуст.');
        }
    } catch (error) {
        sendMessage(chatId, 'Произошла ошибка при получении списка активных групп.');
        console.error(error);
    }
};

exports.getPendingGroups = async (chatId) => {
    try {
        const groups = await db.Group.findAll({ where: { status: 'pending' } });
        if (groups.length > 0) {
            const groupList = groups.map(group => `ID: ${group.id}, Name: ${group.name}`).join('\n');
            sendMessage(chatId, `Список групп, ожидающих подтверждения:\n${groupList}`);
        } else {
            sendMessage(chatId, 'Список групп, ожидающих подтверждения, пуст.');
        }
    } catch (error) {
        sendMessage(chatId, 'Произошла ошибка при получении списка групп, ожидающих подтверждения.');
        console.error(error);
    }
};
