const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./models'); // Импорт sequelize из index.js в models
const routes = require('./routes');
const logger = require('./services/logger');
require('dotenv').config();

// Запуск бота
require('./bot');

const app = express();
app.use(bodyParser.json());
app.use('/api', routes);

sequelize.sync({ alter: true }).then(() => {
    logger.info('Database synchronized');
    app.listen(3000, () => {
        logger.info('Server is running on port 3000');
    });
}).catch(err => {
    logger.error('Unable to synchronize the database:', err);
});
