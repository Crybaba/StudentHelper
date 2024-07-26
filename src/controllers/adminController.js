const User = require('../models/user');

// Получение всех пользователей
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
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
        } else {
            res.status(404).json({ error: 'Пользователь не найден' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Ошибка обновления роли пользователя' });
    }
};
