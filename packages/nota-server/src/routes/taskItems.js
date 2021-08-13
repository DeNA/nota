const { Task, TaskItem, Annotation, sequelize } = require("../models");
const datasource = require("../lib/datasource");
const sharp = require("sharp");
const stream = require("stream");
const { annotationTemplate } = require("./annotations");

const getTaskItemBinary = async function(req, res, next) {
  try {
    const task = await Task.scope("forTaskItemBinary").findByPk(
      res.locals.task.id
    );
    const taskItem = await TaskItem.scope("withMediaItemData").findByPk(
      res.locals.taskItem.id
    );

    const ds = datasource(taskItem.mediaItem.mediaSource);
    const imageMetadata = taskItem.mediaItem.metadata;
    const template = task.taskTemplate.template;
    const range = req.headers.range;
    let fileSize = null;

    const metadata = {
      ...imageMetadata,
      importPathId: taskItem.mediaItem.mediaSource.id,
      resource: taskItem.mediaItem.path
    };

    if (range) {
      const stat = await ds.statItem({
        file: taskItem.mediaItem.name,
        metadata
      });
      fileSize = stat.size;
    }

    // RETURN FOR VIDEO
    if (template.mediaType === "VIDEO") {
      if (range && fileSize) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;
        const imageStream = await ds.readItem({
          file: taskItem.mediaItem.name,
          metadata,
          range,
          start,
          end
        });
        const head = {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": "video/mp4"
        };

        res.writeHead(206, head);
        imageStream.pipe(res);
      } else {
        const head = {
          "content-type": "video/mp4",
          "content-length": fileSize,
          "x-timestamp": Date.now(),
          "x-sent": "true"
        };
        const imageStream = await ds.readItem({
          file: taskItem.mediaItem.name,
          metadata,
          range
        });
        res.writeHead(200, head);
        imageStream.pipe(res);
      }
      return;
    }

    // IMAGE and EPIPOLAR_IMAGE_SET
    const { mediaItemSuffix = "" } = req.params;
    const { mediaSuffixSeparator = "_", mediaExtension = "" } =
      template.mediaOptions || {};
    const suffix = `${mediaSuffixSeparator}${mediaItemSuffix}${
      mediaExtension ? "." + mediaExtension : ""
    }`;
    const imageSetExtension = `.${template.mediaExtensions[0] || ""}`;
    const itemName = taskItem.mediaItem.name.replace(imageSetExtension, "");
    const fileName = mediaItemSuffix
      ? itemName + suffix
      : taskItem.mediaItem.name;
    const imageStream = await ds.readItem({
      metadata: { ...metadata, fileName }
    });

    imageStream.on("error", err => {
      next(err);
    });

    // GET SIZE FOR IMAGES
    if (template.mediaType === "IMAGE" && !imageMetadata.size) {
      const dummy = new stream.PassThrough();
      const metaReader = sharp();
      metaReader.metadata();

      metaReader.on("info", async ({ height, width }) => {
        metaReader.destroy();
        imageMetadata.size = {
          height,
          width
        };

        taskItem.mediaItem.metadata = imageMetadata;
        await taskItem.mediaItem.save();
      });
      imageStream.pipe(metaReader).pipe(dummy);
    }

    res.setHeader("content-type", "image/jpeg");
    res.setHeader("x-timestamp", Date.now());
    res.setHeader("x-sent", "true");
    imageStream.pipe(res);
  } catch (err) {
    next(err);
  }
};

const getTaskItemBinarySidecar = async function(req, res, next) {
  try {
    const task = await Task.scope("forTaskItemBinary").findByPk(
      res.locals.task.id
    );
    const taskItem = await TaskItem.scope("withMediaItemData").findByPk(
      res.locals.taskItem.id
    );

    const ds = datasource(taskItem.mediaItem.mediaSource);
    const template = task.taskTemplate.template;
    const { predictionFileSuffix } = template.mediaOptions || {};

    if (!predictionFileSuffix) {
      const error = new Error("Bad request");
      error.status = 400;
      next(error);
      return;
    }
    const fileName = `${taskItem.mediaItem.name}.${predictionFileSuffix}`;
    const metadata = {
      ...taskItem.mediaItem.metadata,
      fileName,
      importPathId: taskItem.mediaItem.mediaSource.id,
      resource: taskItem.mediaItem.path
    };

    // Check for existence
    const stat = await ds.statItem({ metadata });

    if (!stat) {
      const error = new Error("Not Found");
      error.status = 404;
      next(error);
      return;
    }

    // Return file
    const fileStream = await ds.readItem({ metadata });

    fileStream.on("error", err => {
      next(err);
    });

    res.setHeader("content-type", "application/json");
    res.setHeader("x-timestamp", Date.now());
    res.setHeader("x-sent", "true");
    fileStream.pipe(res);
  } catch (err) {
    next(err);
  }
};

const taskItemTemplate = function(taskItem) {
  return {
    id: taskItem.id,
    name: taskItem.mediaItem.name,
    externalMetadata: taskItem.mediaItem.metadata.externalMetadata || null,
    status: taskItem.status,
    annotations: taskItem.annotations.map(annotationTemplate)
  };
};
const updateTaskItem = async function(req, res, next) {
  try {
    const { status } = req.body;
    const taskItem = res.locals.taskItem;
    const updateData = { updatedBy: req.user.id };
    const updateFields = ["updatedBy"];

    if (status !== undefined) {
      updateData.status = status;
      updateFields.push("status");

      if (status === TaskItem.STATUS.DONE && !res.locals.taskItem.completedBy) {
        updateFields.push("completedBy");
        updateFields.push("completedAt");

        updateData.completedBy = req.user.id;
        updateData.completedAt = sequelize.Sequelize.fn("NOW");
      }
    }

    await taskItem.update(updateData, {
      fields: updateFields
    });

    const response = await TaskItem.scope([
      "withAnnotations",
      "withMediaItemData"
    ]).findByPk(taskItem.id);

    res.locals.response = response;
    res.locals.responseTemplate = taskItemTemplate;
    next();
  } catch (err) {
    next(err);
  }
};

const resetTaskItem = async function(req, res, next) {
  try {
    await Annotation.destroy({
      where: {
        taskItemId: res.locals.taskItem.id
      }
    });

    await res.locals.taskItem.createDefaultAnnotations(req.user);
    const annotations = await res.locals.taskItem.getAnnotations();

    res.locals.response = annotations;
    res.locals.responseTemplate = a => a.map(annotationTemplate);
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTaskItemBinary,
  getTaskItemBinarySidecar,
  updateTaskItem,
  taskItemTemplate,
  resetTaskItem
};
