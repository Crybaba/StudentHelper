const bot = require('./bot');
const User = require('./models/user');

// Команда для получения всех пользователей
bot.onText(/\/users/, async (msg) => {
    const chatId = msg.chat.id;

    const user = await User.findOne({ where: { telegram_id: msg.from.id } });
    if (user && user.is_admin) {
        const users = await User.findAll();
        let response = 'Список пользователей:\n';
        users.forEach((u) => {
            response += `${u.id}. ${u.name} - ${u.is_admin ? 'Admin' : 'User'}\n`;
        });
        bot.sendMessage(chatId, response);
    } else {
        bot.sendMessage(chatId, 'У вас нет прав для выполнения этой команды.');
    }
});

// Команда для обновления роли пользователя
bot.onText(/\/update_role (\d+) (\d)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = parseInt(match[1]);
    const isAdmin = match[2] === '1';

    const user = await User.findOne({ where: { telegram_id: msg.from.id } });
    if (user && user.is_admin) {
        const targetUser = await User.findByPk(userId);
        if (targetUser) {
            targetUser.is_admin = isAdmin;
            await targetUser.save();
            bot.sendMessage(chatId, `Роль пользователя ${targetUser.name} обновлена.`);
        } else {
            bot.sendMessage(chatId, 'Пользователь не найден.');
        }
    } else {
        bot.sendMessage(chatId, 'У вас нет прав для выполнения этой команды.');
    }
});
