const { Model, DataTypes } = require("sequelize");

module.exports = function(sequelize) {
  class MediaItem extends Model {}

  MediaItem.STATUS = {
    DELETED: -100,
    NOT_FOUND: 0,
    OK: 1
  };

  MediaItem.init(
    {
      name: DataTypes.TEXT,
      path: DataTypes.TEXT,
      metadata: {
        type: DataTypes.TEXT,
        get() {
          return this.getDataValue("metadata")
            ? JSON.parse(this.getDataValue("metadata"))
            : undefined;
        },
        set(metadata) {
          this.setDataValue(
            "metadata",
            metadata ? JSON.stringify(metadata) : undefined
          );
        }
      },
      status: DataTypes.INTEGER
    },
    {
      sequelize,
      tableName: "media_items",
      underscored: true,
      timestamps: true,
      name: { singular: "mediaItem", plural: "mediaItems" }
    }
  );

  return function() {
    // SCOPES;
    MediaItem.belongsTo(sequelize.models.MediaSource, {
      foreignKey: "mediaSourceId"
    });

    MediaItem.belongsTo(sequelize.models.User, {
      foreignKey: "updatedBy",
      as: "updatedByUser"
    });

    MediaItem.belongsTo(sequelize.models.User, {
      foreignKey: "createdBy",
      as: "createdByUser"
    });

    MediaItem.hasMany(sequelize.models.TaskItem);
    MediaItem.hasMany(sequelize.models.MediaItemTag);
  };
};
