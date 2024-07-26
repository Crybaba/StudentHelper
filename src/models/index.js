const sequelize = require('../config/database');
const User = require('./user');
const Group = require('./group');
const UserGroup = require('./userGroup');
const Task = require('./task');
const Subject = require('./subject');
const Event = require('./event');

User.belongsToMany(Group, { through: UserGroup });
Group.belongsToMany(User, { through: UserGroup });

Group.hasMany(Task);
Task.belongsTo(Group);

User.hasMany(Task, { foreignKey: 'creator_id' });
Task.belongsTo(User, { foreignKey: 'creator_id' });

Group.hasMany(Subject);
Subject.belongsTo(Group);

module.exports = {
    sequelize,
    User,
    Group,
    UserGroup,
    Task,
    Subject,
    Event
};
