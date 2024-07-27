const TelegramBot = require('node-telegram-bot-api');
const token = '7461792381:AAEIKFHDNLwC17s_3bro-oHCT2JCJ1YP-FE'; // Замените на ваш токен бота
const bot = new TelegramBot(token, { polling: true });

module.exports = bot;
