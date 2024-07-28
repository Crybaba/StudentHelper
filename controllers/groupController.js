const db = require('../models');

exports.createGroup = async (groupName) => {
    try {
        const group = await db.Group.create({ name: groupName });
        return { success: true, message: `Заявка на добавление группы "${groupName}" отправлена на рассмотрение.`, group };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Произошла ошибка при отправке заявки.' };
    }
};

exports.deleteGroup = async (groupId) => {
    try {
        const group = await db.Group.findByPk(groupId);
        if (group) {
            await group.destroy();
            return { success: true, message: `Группа с ID ${groupId} была удалена.` };
        } else {
            return { success: false, message: `Группа с ID ${groupId} не найдена.` };
        }
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Произошла ошибка при удалении группы.' };
    }
};

exports.getGroups = async () => {
    try {
        const groups = await db.Group.findAll();
        if (groups.length > 0) {
            return { success: true, groups };
        } else {
            return { success: false, message: 'Список групп пуст.' };
        }
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Произошла ошибка при получении списка групп.' };
    }
};

exports.getActiveGroups = async () => {
    try {
        const groups = await db.Group.findAll({ where: { status: 'active' } });
        if (groups.length > 0) {
            return { success: true, groups };
        } else {
            return { success: false, message: 'Список активных групп пуст.' };
        }
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Произошла ошибка при получении списка активных групп.' };
    }
};

exports.getPendingGroups = async () => {
    try {
        const groups = await db.Group.findAll({ where: { status: 'pending' } });
        if (groups.length > 0) {
            return { success: true, groups };
        } else {
            return { success: false, message: 'Список групп, ожидающих подтверждения, пуст.' };
        }
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Произошла ошибка при получении списка групп, ожидающих подтверждения.' };
    }
};
