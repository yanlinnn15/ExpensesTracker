const { verify } = require("jsonwebtoken");

module.exports = (sequelize, DataTypes) => {

    const Users = sequelize.define("Users", {
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
            defaultValue: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        lastActive: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        registeredAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },

    });

    Users.associate = (models) => {
        Users.hasMany(models.Categories, {
            onDelete: "CASCADE"
        });
        Users.hasMany(models.Budgets, {
            onDelete: "CASCADE"
        });
        Users.hasMany(models.Transactions, {
            onDelete: "CASCADE"
        });
    };

    return Users;
}