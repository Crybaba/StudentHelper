module.exports = (sequelize, DataTypes) => {
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
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        creator_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        is_personal: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        group_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'groups',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.ENUM('pending', 'active'),
            defaultValue: 'pending'
        }
    }, {
        tableName: 'tasks',
        timestamps: true
    });

    Task.associate = (models) => {
        Task.belongsTo(models.User, { foreignKey: 'creator_id' });
        Task.belongsTo(models.Group, { foreignKey: 'group_id' });
    };

    return Task;
};