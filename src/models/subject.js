const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Group = require('./group');

const Subject = sequelize.define('Subject', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    group_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Group,
            key: 'id'
        }
    }
});

module.exports = Subject;
