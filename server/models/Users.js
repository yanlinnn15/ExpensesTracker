const { verify } = require("jsonwebtoken");

module.exports = (sequelize, DataTypes) => {

    const Users = sequelize.define("Users", {

        fName: {
            type:DataTypes.STRING,
            allowNull:false
        },
        lName: {
            type: DataTypes.STRING,
            allowNull:false
        },
        email:{
            type: DataTypes.STRING,
            allowNull:false
        },
        password:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        isGuest:{
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        active:{
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        verify:{
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        verifyToken:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        verifyTokenEx:{
            type: DataTypes.DATE,
            allowNull:true
        },
        resetToken:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        resetTokenEx:{
            type: DataTypes.DATE,
            allowNull:true
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