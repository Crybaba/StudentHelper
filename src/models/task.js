const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Group = require('./group');

const Task = sequelize.define('Task', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: false
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: true
    },
    creator_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        }
    },
    group_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Group,
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed'),
        defaultValue: 'pending'
    }
});

module.exports = Task;
