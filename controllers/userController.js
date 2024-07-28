const db = require('../models');

exports.createUser = async (userData) => {
    try {
        const user = await db.User.create(userData);
        return { success: true, message: 'Пользователь успешно создан.', user };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Произошла ошибка при создании пользователя.' };
    }
};

exports.updateUser = async (userId, updatedData) => {
    try {
        const user = await db.User.findByPk(userId);
        if (user) {
            await user.update(updatedData);
            return { success: true, message: `Пользователь с ID ${userId} был обновлен.`, user };
        } else {
            return { success: false, message: `Пользователь с ID ${userId} не найден.` };
        }
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Произошла ошибка при обновлении пользователя.' };
    }
};

exports.deleteUser = async (userId) => {
    try {
        const user = await db.User.findByPk(userId);
        if (user) {
            await user.destroy();
            return { success: true, message: `Пользователь с ID ${userId} был удален.` };
        } else {
            return { success: false, message: `Пользователь с ID ${userId} не найден.` };
        }
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Произошла ошибка при удалении пользователя.' };
    }
};

exports.promoteToCurator = async (userId) => {
    try {
        const user = await db.User.findByPk(userId);
        if (user) {
            await user.update({ role: 'curator' });
            return { success: true, message: `Пользователь с ID ${userId} был повышен до куратора.`, user };
        } else {
            return { success: false, message: `Пользователь с ID ${userId} не найден.` };
        }
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Произошла ошибка при повышении пользователя.' };
    }
};