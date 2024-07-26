const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    telegram_id: {
        type: DataTypes.BIGINT,
        unique: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('student', 'curator'),
        defaultValue: 'student'
    },
    is_admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

module.exports = User;
