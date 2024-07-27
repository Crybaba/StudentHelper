const express = require('express');
const app = express();
const mysql = require('mysql2');
const db = require('./models');
const bot = require('./bot'); // Импортируем бота

// Импортируем маршруты
const startRoute = require('./routes/start');
const addGroupRoute = require('./routes/addGroup');
const addPersonalTaskRoute = require('./routes/addPersonalTask');

// Используем маршруты
app.use('/start', startRoute);
app.use('/addGroup', addGroupRoute);
app.use('/addPersonalTask', addPersonalTaskRoute);

// Привязываем команды бота к маршрутам
bot.onText(/\/start/, (msg) => {
    startRoute.handleStart(bot, msg);
});

bot.onText(/\/addgroup/, (msg) => {
    addGroupRoute.handleAddGroup(bot, msg);
});

bot.onText(/\/addpersonaltask/, (msg) => {
    addPersonalTaskRoute.handleAddPersonalTask(bot, msg);
});

db.sequelize.sync().then((rec) => {
    app.listen(3000, () => {
        console.log(`Server started on port 3000`);
    });
});
