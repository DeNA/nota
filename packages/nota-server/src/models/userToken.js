const { Model, DataTypes } = require("sequelize");

module.exports = function(sequelize) {
  class UserToken extends Model {}
  UserToken.init(
    {
      token: DataTypes.STRING,
      expire: DataTypes.DATE
    },
    {
      sequelize,
      tableName: "user_tokens",
      underscored: true,
      timestamps: true,
      updatedAt: false,
      name: { singular: "userToken", plural: "userTokens" }
    }
  );

  return () => {
    UserToken.belongsTo(sequelize.models.User, {
      foreignKey: "userId"
    });
  };
};
