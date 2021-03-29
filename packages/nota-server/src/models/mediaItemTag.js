const { Model, DataTypes } = require("sequelize");

module.exports = function(sequelize) {
  class MediaItemTag extends Model {}

  MediaItemTag.TYPE = {
    STRING: 1,
    INTEGER: 2,
    DATETIME: 3
  };

  MediaItemTag.init(
    {
      name: { type: DataTypes.STRING, primaryKey: true },
      type: DataTypes.INTEGER,
      valueString: DataTypes.STRING,
      valueInteger: DataTypes.INTEGER,
      valueDatetime: DataTypes.DATE
    },
    {
      sequelize,
      tableName: "media_item_tags",
      underscored: true,
      timestamps: false,
      name: { singular: "mediaItemTag", plural: "mediaItemTags" }
    }
  );

  return function() {
    // SCOPES

    MediaItemTag.belongsTo(sequelize.models.MediaItem, {
      foreignKey: "mediaItemId",
      primaryKey: true
    });
  };
};
