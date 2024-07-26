const { User, Group, UserGroup, Task, Subject, Event } = require('../models');
const logger = require('../services/logger');

// Получение всех пользователей
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
        logger.info('All users retrieved successfully');
    } catch (error) {
        logger.error('Error retrieving users: ', error);
        res.status(500).json({ error: 'Ошибка получения пользователей' });
    }
};

// Обновление роли пользователя
exports.updateUserRole = async (req, res) => {
    const { userId, isAdmin } = req.body;
    try {
        const user = await User.findByPk(userId);
        if (user) {
            user.is_admin = isAdmin;
            await user.save();
            res.json({ message: 'Роль пользователя обновлена' });
            logger.info(`User role updated successfully: UserId=${userId}, isAdmin=${isAdmin}`);
        } else {
            res.status(404).json({ error: 'Пользователь не найден' });
            logger.warn(`User not found: UserId=${userId}`);
        }
    } catch (error) {
        logger.error('Error updating user role: ', error);
        res.status(500).json({ error: 'Ошибка обновления роли пользователя' });
    }
};
