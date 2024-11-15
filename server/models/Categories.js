module.exports = (sequelize, DataTypes) => {

    const Categories = sequelize.define("Categories", {

        name:{
            type:DataTypes.STRING,
            allowNull:false
        },
        is_income:{
            type:DataTypes.BOOLEAN,
            allowNull:false
        }

    });

    Categories.associate = (models) => {
        Categories.belongsTo(models.Users, {
            onDelete: "CASCADE"
        });
        Categories.hasMany(models.Transactions, {
            onDelete: "CASCADE"
        });
        Categories.hasMany(models.Budgets, {
            onDelete: "CASCADE"
        });
        Categories.belongsTo(models.Icons, {
            onDelete: "CASCADE"
        });
    };

    return Categories;
}