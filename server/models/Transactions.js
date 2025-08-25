module.exports = (sequelize, DataTypes) => {

    const Transactions = sequelize.define("Transactions", {
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false
        },
        type: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        remark: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });

    Transactions.associate = (models) => {
        Transactions.belongsTo(models.Users, {
            onDelete: "CASCADE"
        });
        
        Transactions.belongsTo(models.Categories, {
            onDelete: "CASCADE"
        });
    };

    return Transactions;
}