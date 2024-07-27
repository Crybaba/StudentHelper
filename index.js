const express = require('express');
const app = express();

const mysql = require('mysql2');

const db = require('./models');

db.sequelize.sync().then((rec) => {
    app.listen(3000, () => {
        console.log(`Server started on port 3000`);
    })
})