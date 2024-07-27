const sequelize = require('../config/database');
const User = require('./user');
const Group = require('./group');
const Task = require('./task');

Group.hasMany(Task);
Task.belongsTo(Group);

User.hasMany(Task, { foreignKey: 'creator_id' });
Task.belongsTo(User, { foreignKey: 'creator_id' });

module.exports = {
    sequelize,
    User,
    Group,
    Task,
};
