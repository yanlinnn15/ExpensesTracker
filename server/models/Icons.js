module.exports = (sequelize, DataTypes) => {

    const Icons = sequelize.define("Icons", {

        icon_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        icon_class:{
            type: DataTypes.STRING,
            allowNull: false,
        }
    });

    Icons.associate = (models) => {
        Icons.hasMany(models.Categories, {
            onDelete: "CASCADE"
        });
    };

    return Icons;
}