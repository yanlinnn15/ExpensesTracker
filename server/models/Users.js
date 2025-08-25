const { verify } = require("jsonwebtoken");

module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define("Users", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        googleId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        isGuest: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        lastActive: {
            type: DataTypes.DATE,
            allowNull: true
        },
        registeredAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'Users'
    });

    Users.associate = (models) => {
        Users.hasMany(models.Categories, {
            onDelete: "cascade"
        });
        Users.hasMany(models.Transactions, {
            onDelete: "cascade"
        });
        Users.hasMany(models.Budgets, {
            onDelete: "cascade"
        });
    };

    return Users;
}