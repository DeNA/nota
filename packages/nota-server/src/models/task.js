const { Model, DataTypes, Op, QueryTypes } = require("sequelize");
const datasource = require("../lib/datasource");
const parser = require("../lib/parser");
const { logger } = require("../lib/logger");
const { prepareArchive, writeArchives } = require("../lib/exportUtils");
const moment = require("moment");
const { annotationDefaultLabels } = require("../lib/utils");
const config = require("../config");

module.exports = function(sequelize) {
  class Task extends Model {}

  Task.STATUS = {
    DELETED: -100,
    UPDATING_ERROR: -2,
    CREATING_ERROR: -1,
    CREATING: 0,
    UPDATING: 1,
    HIDDEN: 50,
    READY: 100,
    DONE: 500
  };

  Task.EXPORT_TARGET = {
    ALL: 1,
    NEW_AND_UPDATED: 2
  };

  Task.prototype.canBeAnnotated = function() {
    return (
      this.status !== Task.STATUS.DELETED &&
      this.status !== Task.STATUS.CREATING_ERROR &&
      this.status !== Task.STATUS.DONE
    );
  };

  Task.prototype.initializeTask = async function(refresh = false) {
    try {
      const mediaSource = await this.getMediaSource();
      const taskTemplate = await this.getTaskTemplate();
      const ds = datasource(mediaSource);
      const p = parser(taskTemplate.template.parser);
      const { options, conditions } = this.mediaSourceConfig;

      // Retrieve all media items
      const mediaItemIds = await mediaSource.searchMediaItemIds(
        {
          path: options.path || "",
          taskTemplateId: taskTemplate.id,
          extensions: taskTemplate.template.mediaExtensions || [],
          limit: options.limit,
          excludeAlreadyUsed: options.excludeAlreadyUsed || false
        },
        conditions
      );

      const mediaItems = await mediaSource.getMediaItems({
        attributes: ["id", "name", "path"],
        where: {
          id: {
            [Op.in]: mediaItemIds
          }
        }
      });

      const newMediaItems = [];

      // When refreshing a task, filter only new items
      if (refresh) {
        for (const mediaItem of mediaItems) {
          const taskItems = await this.getTaskItems({
            where: {
              mediaItemId: mediaItem.id
            }
          });

          if (!taskItems.length) {
            newMediaItems.push(mediaItem);
          }
        }
      }

      const importItems = refresh ? newMediaItems : mediaItems;

      // List files from the source for checking json sidecar existence
      const files = importItems.length
        ? await ds.listItems({
            resource: {
              pathId: mediaSource.id,
              file: options.path || ""
            }
          })
        : [];

      // Prepare auto-create annotations
      const annotationsDefinition = taskTemplate.template.annotations || [];
      const autoCreateAnnotations = annotationsDefinition.filter(
        annotationDefinition =>
          annotationDefinition.options &&
          annotationDefinition.options.autoCreate
      );
      let added = 0;

      // Create items
      for (const mediaItem of importItems) {
        // auto-create annotations
        const annotations = autoCreateAnnotations.map(annotation => ({
          labelsName: annotation.name,
          labels: annotationDefaultLabels(annotation.labels)
        }));

        // Check for sidecar json file annotations
        const jsonFileName = mediaItem.name + ".json";
        const jsonFileExists = files.find(
          file =>
            file.name === jsonFileName &&
            file.metadata.resource === mediaItem.path
        );

        if (jsonFileExists) {
          const jsonFileReadStream = await ds.readItem({
            metadata: {
              importPathId: mediaSource.id,
              resource: mediaItem.path,
              fileName: jsonFileName
            }
          });
          let jsonFileContents = "";

          for await (const chunk of jsonFileReadStream) {
            jsonFileContents += chunk;
          }

          const json = JSON.parse(jsonFileContents);
          const imageData = p.parse(json);
          annotations.push(...(imageData.annotations || []));
        }

        // Create item
        await this.createTaskItem(
          {
            mediaItemId: mediaItem.id,
            status: sequelize.models.TaskItem.STATUS.NOT_DONE,
            annotations: annotations.map(annotation => ({
              ...annotation,
              createdBy: this.createdBy
            })),
            createdBy: this.createdBy
          },
          {
            include: [sequelize.models.Annotation]
          }
        );
        added++;
      }

      if (!refresh || this.status !== Task.STATUS.READY) {
        this.status = Task.STATUS.READY;
        await this.save();
      }
      return added;
    } catch (error) {
      logger.error(error);
      this.status = refresh
        ? Task.STATUS.UPDATING_ERROR
        : Task.STATUS.CREATING_ERROR;
      await this.save();
    }
  };

  Task.prototype.statusReset = async function(options = {}) {
    const {
      annotations = false,
      taskItems = false,
      taskAssignments = false,
      annotationConditions = {},
      taskItemConditions = {},
      taskAssignmentConditions = {}
    } = options;

    // Transaction
    const transaction = await sequelize.transaction();
    const result = {};

    try {
      // Reset annotation status
      if (annotations) {
        const annotationName = Array.isArray(annotationConditions.name)
          ? annotationConditions.name
          : false;
        const replacements = { taskId: this.id };

        if (annotationName) {
          replacements.annotationName = annotationName;
        }
        const [, annotationUpdatedCount] = await sequelize.query(
          `UPDATE annotations
SET status=0
WHERE task_item_id IN (
  SELECT id 
  FROM task_items 
  WHERE task_id=:taskId
) AND status=1
${annotationName ? "AND labels_name IN (:annotationName)" : ""}`,
          {
            replacements,
            type: QueryTypes.UPDATE,
            transaction
          }
        );
        result.annotationUpdatedCount = annotationUpdatedCount;
      }

      // Reset taskItem status
      if (taskItems) {
        const { onlyWithOngoing = false } = taskItemConditions;
        const replacements = { taskId: this.id };
        const onlyOngoingSubquery = onlyWithOngoing
          ? `
AND id IN(
  SELECT task_item_id
  FROM annotations
  WHERE task_item_id IN (
    SELECT task_item_id
    FROM (
      SELECT id as task_item_id 
      FROM task_items 
      WHERE task_id=:taskId
    ) AS tmp
  ) AND status=0
)
`
          : "";

        const [, taskItemsUpdatedCount] = await sequelize.query(
          `
UPDATE task_items
SET status=0 
WHERE task_id=:taskId
AND status=1
${onlyOngoingSubquery}`,
          {
            replacements,
            type: QueryTypes.UPDATE,
            transaction
          }
        );
        result.taskItemsUpdatedCount = taskItemsUpdatedCount;
      }

      // Reset taskAssignment status
      if (taskAssignments) {
        const { onlyWithOngoing = false } = taskAssignmentConditions;
        const replacements = { taskId: this.id };
        const onlyOngoingSubquery = onlyWithOngoing
          ? `
AND id IN(
  SELECT task_assignment_id 
  FROM task_items 
  WHERE task_id=:taskId 
  AND status=0
)
`
          : "";

        const [, taskAssignmentsUpdatedCount] = await sequelize.query(
          `
UPDATE task_assignments
SET status=100 
WHERE task_id=:taskId
AND status=500
${onlyOngoingSubquery}`,
          {
            replacements,
            type: QueryTypes.UPDATE,
            transaction
          }
        );
        result.taskAssignmentsUpdatedCount = taskAssignmentsUpdatedCount;
      }

      // Commit
      await transaction.commit();

      // Return results
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  Task.prototype.exportTask = async function(options) {
    const [name, archive, exportedCount] = await this.getArchive(options);

    if (!exportedCount) {
      return { file: null, count: 0 };
    }

    const mediaSource = await this.getMediaSource();
    const ds = datasource(mediaSource);
    const written = await writeArchives([[name, archive]], ds);

    return { file: written[0], count: exportedCount };
  };

  Task.prototype.getArchive = async function(options) {
    const mediaItems = await this.getMediaItemsForArchive(options);

    if (!mediaItems.length) {
      return [, , 0];
    }

    const archive = await prepareArchive(mediaItems);
    const time = moment().format("YYYYMMDD_x");
    const name = options.name
      ? `${options.name}.tar.gz`
      : `${this.name}_${time}.tar.gz`;

    return [name, archive, mediaItems.length];
  };

  Task.prototype.getMediaItemsForArchive = async function({
    from,
    to,
    includeOngoing = true
  }) {
    const taskTemplate = await this.getTaskTemplate();
    const p = parser(taskTemplate.template.parser);

    const query = {
      attributes: ["id", "status"],
      include: [
        {
          attributes: ["name", "metadata", "path"],
          model: sequelize.models.MediaItem
        },
        {
          attributes: ["id", "boundaries", "labels", "labelsName", "status"],
          model: sequelize.models.Annotation
        }
      ],
      where: {
        [Op.and]: []
      },
      order: [["id", "ASC"], [sequelize.models.Annotation, "id", "ASC"]]
    };

    query.where[Op.and].push({ status: sequelize.models.TaskItem.STATUS.DONE });

    if (!includeOngoing) {
      query.include.push(sequelize.models.TaskAssignment.scope("onlyDone"));
    }

    if (from) {
      query.where[Op.and].push({
        updatedAt: { [Op.gt]: from }
      });
    }

    if (to) {
      query.where[Op.and].push({
        updatedAt: { [Op.lte]: to }
      });
    }

    const mediaItems = await this.getTaskItems(query);

    return mediaItems
      .map(mediaItem => {
        mediaItem.notaUrl = [
          config.nota.host || "",
          "annotation",
          this.projectId,
          this.id,
          mediaItem.taskAssignment ? mediaItem.taskAssignment.id : "??",
          mediaItem.id
        ].join("/");

        const [parsedFileName, parsedFile] = p.serialize(mediaItem);
        return parsedFile ? [parsedFileName, parsedFile] : null;
      })
      .filter(image => image !== null);
  };

  Task.prototype.getLastExportJobs = async function() {
    const exportJobs = await sequelize.models.JobTask.findAll({
      where: {
        projectId: this.projectId,
        resourceId: this.id,
        task: sequelize.models.JobTask.TASK.TASK_EXPORT
      },
      order: [["createdAt", "DESC"]],
      limit: 10
    });

    return exportJobs;
  };

  Task.prototype.getLastFetchJobs = async function() {
    const fetchJobs = await sequelize.models.JobTask.findAll({
      where: {
        projectId: this.projectId,
        resourceId: this.id,
        task: sequelize.models.JobTask.TASK.TASK_FETCH
      },
      order: [["createdAt", "DESC"]],
      limit: 10
    });

    return fetchJobs;
  };

  Task.prototype.getLastMaintenanceJobs = async function() {
    const fetchJobs = await sequelize.models.JobTask.findAll({
      where: {
        projectId: this.projectId,
        resourceId: this.id,
        task: sequelize.models.JobTask.TASK.TASK_MAINTENANCE
      },
      order: [["createdAt", "DESC"]],
      limit: 10
    });

    return fetchJobs;
  };

  Task.prototype.softDelete = async function(user) {
    this.status = Task.STATUS.DELETED;
    this.updatedBy = user.id;
    await this.save();
  };

  Task.init(
    {
      name: DataTypes.TEXT,
      description: DataTypes.TEXT,
      status: DataTypes.INTEGER,
      mediaSourceConfig: {
        type: DataTypes.TEXT,
        get() {
          return this.getDataValue("mediaSourceConfig")
            ? JSON.parse(this.getDataValue("mediaSourceConfig"))
            : undefined;
        },
        set(mediaSourceConfig) {
          this.setDataValue(
            "mediaSourceConfig",
            mediaSourceConfig ? JSON.stringify(mediaSourceConfig) : undefined
          );
        }
      },
      isFetchScheduled: DataTypes.BOOLEAN,
      isExportScheduled: DataTypes.BOOLEAN,
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
      },
      exportSchedule: {
        type: DataTypes.TEXT,
        get() {
          return this.getDataValue("exportSchedule")
            ? JSON.parse(this.getDataValue("exportSchedule"))
            : undefined;
        },
        set(exportSchedule) {
          this.setDataValue(
            "exportSchedule",
            exportSchedule ? JSON.stringify(exportSchedule) : undefined
          );
        }
      }
    },
    {
      sequelize,
      tableName: "tasks",
      underscored: true,
      timestamps: true,
      name: { singular: "task", plural: "tasks" }
    }
  );

  return function() {
    // SCOPES
    Task.addScope(
      "defaultScope",
      {
        include: [
          sequelize.models.TaskTemplate.scope("forTask"),
          sequelize.models.MediaSource.scope("forTask"),
          {
            model: sequelize.models.User.scope("forReference"),
            as: "updatedByUser"
          },
          {
            model: sequelize.models.User.scope("forReference"),
            as: "createdByUser"
          }
        ],
        where: {
          status: {
            [Op.not]: Task.STATUS.DELETED
          }
        }
      },
      { override: true }
    );
    Task.addScope("withTaskItemsCount", {
      attributes: {
        include: [
          [sequelize.fn("count", sequelize.col("taskItems.id")), "total"],
          [
            sequelize.fn(
              "sum",
              sequelize.literal(
                `CASE WHEN taskItems.status = 1 THEN 1 ELSE 0 END`
              )
            ),
            "done"
          ],
          [
            sequelize.fn(
              "sum",
              sequelize.literal(
                `CASE WHEN taskItems.task_assignment_id is null THEN 1 ELSE 0 END`
              )
            ),
            "assignable"
          ]
        ]
      },
      include: [
        {
          attributes: ["id", "status"],
          model: sequelize.models.TaskItem
        }
      ],
      group: ["Task.id"]
    });
    Task.addScope("forReference", {
      attributes: ["id", "name", "status"]
    });
    Task.addScope("forTaskItemBinary", {
      attributes: ["id"],
      include: [
        {
          model: sequelize.models.TaskTemplate.scope("full")
        }
      ]
    });
    Task.addScope("raw", {
      raw: true
    });

    // ASSOCIATIONS
    Task.belongsTo(sequelize.models.Project, {
      foreignKey: "projectId"
    });

    Task.belongsTo(sequelize.models.TaskTemplate, {
      foreignKey: "taskTemplateId"
    });

    Task.belongsTo(sequelize.models.MediaSource, {
      foreignKey: "mediaSourceId"
    });

    Task.hasMany(sequelize.models.TaskAssignment);
    Task.hasMany(sequelize.models.TaskItem);

    Task.belongsTo(sequelize.models.User, {
      as: "updatedByUser",
      foreignKey: "updatedBy"
    });

    Task.belongsTo(sequelize.models.User, {
      as: "createdByUser",
      foreignKey: "createdBy"
    });
  };
};
