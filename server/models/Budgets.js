module.exports = (sequelize, DataTypes) => {

    const Budgets = sequelize.define("Budgets", {

        amount:{
            type: DataTypes.DECIMAL(20,2),
            allowNull:false,
        },
        remark:{
            type: DataTypes.STRING,
            allowNull:true
        },

    });

    Budgets.associate = (models) => {
        Budgets.belongsTo(models.Users, {
            onDelete: "CASCADE"
        });
        Budgets.belongsTo(models.Categories, {
            onDelete: "CASCADE"
        });
    };

    return Budgets;
}