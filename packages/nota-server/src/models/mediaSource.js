const { Model, DataTypes, Op } = require("sequelize");
const datasource = require("../lib/datasource");
const { logger } = require("../lib/logger");
const moment = require("moment");
const { absolutePath } = require("../lib/datasource/utils");

module.exports = function(sequelize) {
  class MediaSource extends Model {}

  MediaSource.STATUS = {
    UPDATING_ERROR: -2,
    CREATING_ERROR: -1,
    CREATING: 0,
    UPDATING: 1,
    HIDDEN: 50,
    READY: 100
  };

  MediaSource.prototype.getItemsTree = async function() {
    const items = await this.getMediaItems({
      attributes: [
        "path",
        [sequelize.fn("count", sequelize.col("id")), "files"]
      ],
      group: ["path"]
    });
    const tree = items.map(item => ({
      path: `/${item.path}`,
      files: parseInt(item.get("files"))
    }));
    const emptyBranches = [];

    tree.forEach(branch => {
      const [, ...folders] = branch.path
        .substr(1)
        .split("/")
        .reverse();
      let path = "";
      folders.reverse().forEach(folder => {
        path = `${path}/${folder}`;

        if (
          !tree.some(branch => branch.path === path) &&
          !emptyBranches.some(branch => branch.path === path)
        ) {
          emptyBranches.push({ path, files: 0 });
        }
      });
    });

    return [...tree, ...emptyBranches];
  };

  const getNameCondition = function(alias, name) {
    return `${alias}.name = ${sequelize.escape(name)}`;
  };

  const createStringCondition = function(name, values, alias) {
    const parsed = values
      .filter(value => !!value)
      .map(value => sequelize.escape(value));

    if (!parsed.length) {
      return null;
    }
    const nameCondition = getNameCondition(alias, name);
    const valuesIn = parsed.join(",");
    return `(${nameCondition} AND ${alias}.value_string IN (${valuesIn}))`;
  };
  const createIntegerCondition = function(name, values, alias) {
    const parsed = values.filter(
      value =>
        value && (Number.isInteger(value[0]) || Number.isInteger(value[1]))
    );

    if (!parsed.length) {
      return null;
    }

    const nameCondition = getNameCondition(alias, name);
    const conditions = parsed.map(([lower, higher]) => {
      const valueConditions = [
        nameCondition,
        lower === null
          ? null
          : `${alias}.value_integer >= ${sequelize.escape(lower)}`,
        higher === null
          ? null
          : `${alias}.value_integer <= ${sequelize.escape(higher)}`
      ]
        .filter(condition => !!condition)
        .join(" AND ");

      return `(${valueConditions})`;
    });

    return `(${conditions.join(" OR ")})`;
  };

  const createDatetimeCondition = function(name, values, alias) {
    const parsed = values.filter(value => value && (value[0] || value[1]));

    if (!parsed.length) {
      return null;
    }

    const nameCondition = getNameCondition(alias, name);
    const conditions = parsed.map(([lower, higher]) => {
      const valueConditions = [
        nameCondition,
        lower === null
          ? null
          : `${alias}.value_datetime >= ${sequelize.escape(lower)}`,
        higher === null
          ? null
          : `${alias}.value_datetime <= ${sequelize.escape(higher)}`
      ]
        .filter(condition => !!condition)
        .join(" AND ");

      return `(${valueConditions})`;
    });

    return `(${conditions.join(" OR ")})`;
  };

  const createMediaItemTagsSubquery = function(filters = [], conditions = {}) {
    const whereStatements = Object.entries(conditions).map(
      ([name, values], i) => {
        const filter = filters.find(filter => filter.name === name);

        if (!filter) {
          return null;
        }

        switch (filter.type) {
          case sequelize.models.MediaItemTag.TYPE.STRING:
            return createStringCondition(name, values, `mit_${i}`);
          case sequelize.models.MediaItemTag.TYPE.INTEGER:
            return createIntegerCondition(name, values, `mit_${i}`);
          case sequelize.models.MediaItemTag.TYPE.DATETIME:
            return createDatetimeCondition(name, values, `mit_${i}`);
          default:
            return null;
        }
      }
    );

    const filteredWhereStatements = whereStatements.filter(
      condition => !!condition
    );

    if (!filteredWhereStatements.length) {
      return null;
    }

    let selectStatement = `SELECT mit_0.media_item_id FROM media_item_tags mit_0`;
    for (let i = 1; i < whereStatements.length; i++) {
      if (whereStatements[i] === null) {
        continue;
      }
      selectStatement = `${selectStatement} INNER JOIN media_item_tags mit_${i} ON mit_0.media_item_id = mit_${i}.media_item_id`;
    }

    return `${selectStatement} WHERE ${filteredWhereStatements.join(" AND ")}`;
  };

  MediaSource.prototype.searchMediaItemIds = async function(
    options = {},
    conditions = {}
  ) {
    const {
      taskTemplateId,
      extensions,
      path,
      excludeAlreadyUsed,
      limit
    } = options;
    const filters = this.config.filters || [];

    const conditionsSubquery = createMediaItemTagsSubquery(filters, conditions);
    const where = {
      mediaSourceId: this.id
    };

    if (conditionsSubquery) {
      where.id = {
        [Op.in]: sequelize.literal(`(${conditionsSubquery})`)
      };
    }

    if (excludeAlreadyUsed) {
      const excludeSubquery = `SELECT DISTINCT media_item_id FROM task_items
        INNER JOIN tasks ON tasks.id = task_items.task_id
        WHERE tasks.task_template_id = ${sequelize.escape(taskTemplateId)}
        AND tasks.status NOT IN ('${sequelize.models.Task.STATUS.DELETED}')`;

      where.id = where.id || {};
      where.id[Op.notIn] = sequelize.literal(`(${excludeSubquery})`);
    }

    if (extensions && extensions.length) {
      where.name = {
        [Op.or]: extensions.map(extension => ({
          [Op.like]: `%.${extension}`
        }))
      };
    }

    if (path && path !== "/") {
      const parsedPath = absolutePath("", [path], false, false);
      where.path = {
        [Op.or]: [
          {
            [Op.like]: parsedPath
          },
          {
            [Op.like]: `${parsedPath}/%`
          }
        ]
      };
    }

    const mediaItemIds = await sequelize.models.MediaItem.findAll({
      attributes: ["id"],
      where,
      raw: true
    });

    if (limit && limit < mediaItemIds.length) {
      return mediaItemIds.slice(0, limit - 1);
    }

    return mediaItemIds.map(mediaItem => mediaItem.id);
  };

  MediaSource.prototype.fetchMediaItems = async function(refresh = false) {
    try {
      const ds = datasource(this);
      const files = await ds.listItems({
        resource: {
          pathId: this.id,
          file: ""
        }
      });

      const mediaExtensions = this.config.extensions;
      const mediaFiles = files.filter(file =>
        mediaExtensions.some(extension => file.name.endsWith("." + extension))
      );
      const newMediaFiles = [];

      if (refresh) {
        const allMediaItems = await this.getMediaItems({
          attributes: ["id", "name", "path"],
          raw: true
        });

        for (const file of mediaFiles) {
          if (
            !allMediaItems.find(
              mi =>
                mi.name === file.metadata.fileName &&
                mi.path === file.metadata.resource
            )
          ) {
            newMediaFiles.push(file);
          }
        }
      }

      if (refresh) {
        this.status = MediaSource.STATUS.UPDATING;
        await this.save();
      }

      let added = 0;

      // Create items
      let batch = [];
      for (const mediaFile of refresh ? newMediaFiles : mediaFiles) {
        // Check for meta json file
        let meta;
        const metaFileName = mediaFile.metadata.fileName + ".meta.json";
        const metaFileExists = files.find(
          file =>
            file.name === metaFileName &&
            file.metadata.resource === mediaFile.metadata.resource
        );

        if (metaFileExists) {
          const metaFileReadStream = await ds.readItem({
            metadata: {
              importPathId: this.id,
              resource: mediaFile.metadata.resource,
              fileName: metaFileName
            }
          });
          let metaFileContents = "";

          for await (const chunk of metaFileReadStream) {
            metaFileContents += chunk;
          }

          meta = JSON.parse(metaFileContents);
        }

        const tags = [];
        if (this.config.filters && meta) {
          this.config.filters.forEach(filter => {
            const filterPath = filter.name.split(".");
            let value = meta[filterPath[0]];

            for (let i = 1; i < filterPath.length; i++) {
              if (value === undefined) {
                return false;
              }
              value = value[filterPath[i]];
            }

            if (value !== undefined) {
              switch (filter.type) {
                case sequelize.models.MediaItemTag.TYPE.STRING:
                  tags.push({
                    name: filter.name,
                    type: sequelize.models.MediaItemTag.TYPE.STRING,
                    valueString: value.toString()
                  });
                  break;
                case sequelize.models.MediaItemTag.TYPE.INTEGER:
                  const integerValue = parseInt(value);

                  if (isNaN(integerValue)) {
                    break;
                  }

                  tags.push({
                    name: filter.name,
                    type: sequelize.models.MediaItemTag.TYPE.INTEGER,
                    valueInteger: integerValue
                  });
                  break;
                case sequelize.models.MediaItemTag.TYPE.DATETIME:
                  const datetimeValue = moment(
                    value,
                    [
                      "YYYY-MM-DD",
                      "YYYY/MM/DD",
                      "YYYY-MM-DD HH:mm",
                      "YYYY/MM/DD HH:mm",
                      "YYYY-MM-DD HH:mm:ss",
                      "YYYY/MM/DD HH:mm:ss",
                      "X"
                    ],
                    true
                  );

                  if (!datetimeValue.isValid()) {
                    break;
                  }

                  tags.push({
                    name: filter.name,
                    type: sequelize.models.MediaItemTag.TYPE.DATETIME,
                    valueDatetime: datetimeValue.toDate()
                  });
                  break;
                default:
              }
            }
          });
        }

        batch.push({
          name: mediaFile.name,
          mediaSourceId: this.id,
          path: mediaFile.metadata.resource,
          metadata: {
            ...mediaFile.metadata,
            name: mediaFile.name,
            externalMetadata: meta
          },
          mediaItemTags: tags,
          status: sequelize.models.MediaItem.STATUS.OK,
          createdBy: this.createdBy
        });
        added++;

        if (batch.length >= 100) {
          await sequelize.models.MediaItem.bulkCreate(batch, {
            fields: [
              "name",
              "mediaSourceId",
              "path",
              "metadata",
              "status",
              "createdBy"
            ],
            include: [sequelize.models.MediaItemTag]
          });
          batch = [];
        }
      }

      if (batch.length) {
        await sequelize.models.MediaItem.bulkCreate(batch, {
          fields: [
            "name",
            "mediaSourceId",
            "path",
            "metadata",
            "status",
            "createdBy"
          ],
          include: [sequelize.models.MediaItemTag]
        });
        batch = [];
      }

      this.status = MediaSource.STATUS.READY;
      await this.save();
      return added;
    } catch (error) {
      console.log(error);
      logger.error(error);
      if (!refresh) {
        this.status = MediaSource.STATUS.CREATING_ERROR;
        await this.save();
      }
    }
  };

  MediaSource.prototype.getLastFetchJobs = async function() {
    const fetchJobs = await sequelize.models.JobTask.findAll({
      where: {
        projectId: this.projectId,
        resourceId: this.id,
        task: sequelize.models.JobTask.TASK.MEDIA_SOURCE_FETCH
      },
      order: [["createdAt", "DESC"]],
      limit: 10
    });

    return fetchJobs;
  };

  MediaSource.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      datasource: DataTypes.TEXT,
      status: DataTypes.INTEGER,
      config: {
        type: DataTypes.TEXT,
        get() {
          return this.getDataValue("config")
            ? JSON.parse(this.getDataValue("config"))
            : undefined;
        },
        set(config) {
          this.setDataValue(
            "config",
            config ? JSON.stringify(config) : undefined
          );
        }
      },
      isFetchScheduled: DataTypes.BOOLEAN,
      fetchSchedule: {
        type: DataTypes.TEXT,
        get() {
          return this.getDataValue("fetchSchedule")
            ? JSON.parse(this.getDataValue("fetchSchedule"))
            : undefined;
        },
        set(fetchSchedule) {
          this.setDataValue(
            "fetchSchedule",
            fetchSchedule ? JSON.stringify(fetchSchedule) : undefined
          );
        }
      }
    },
    {
      sequelize,
      tableName: "media_sources",
      underscored: true,
      timestamps: true,
      name: { singular: "mediaSource", plural: "mediaSources" }
    }
  );

  return function() {
    // SCOPES
    MediaSource.addScope(
      "defaultScope",
      {
        include: [
          {
            model: sequelize.models.User.scope("forReference"),
            as: "updatedByUser"
          },
          {
            model: sequelize.models.User.scope("forReference"),
            as: "createdByUser"
          }
        ]
      },
      { override: true }
    );
    MediaSource.addScope("forTask", {
      attributes: ["id", "name", "config"]
    });

    MediaSource.belongsTo(sequelize.models.Project, {
      foreignKey: "projectId"
    });

    MediaSource.belongsTo(sequelize.models.User, {
      foreignKey: "updatedBy",
      as: "updatedByUser"
    });
    MediaSource.hasMany(sequelize.models.Task);
    MediaSource.hasMany(sequelize.models.MediaItem);

    MediaSource.belongsTo(sequelize.models.User, {
      foreignKey: "createdBy",
      as: "createdByUser"
    });
  };
};
