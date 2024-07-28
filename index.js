const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./models');
const bot = require('./bot'); // Импортируем бота

app.use(bodyParser.json());

// Импортируем маршруты
const startRoute = require('./routes/start');
const addGroupRoute = require('./routes/addGroup');
const inactiveGroupsRoute = require('./routes/inactiveGroups');

// Используем маршруты
app.use('/start', startRoute.router);
app.use('/addGroup', addGroupRoute.router);
app.use('/inactiveGroups', inactiveGroupsRoute.router);

// Привязываем команды бота к маршрутам
bot.onText(/\/start/, (msg) => startRoute.handleStart(bot, msg));
bot.onText(/\/addgroup/, (msg) => addGroupRoute.handleAddGroup(bot, msg));
bot.onText(/\/inactivegroups/, (msg) => inactiveGroupsRoute.handleGetInactiveGroups(bot, msg));

db.sequelize.sync().then(() => {
    app.listen(3000, () => {
        console.log("Server started on port 3000");
    });
});
