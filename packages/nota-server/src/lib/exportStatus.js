const stringify = require("csv-stringify");
const moment = require("moment");
const models = require("../models");

const firstAnnotation = function(annotations) {
  if (!annotations.length) {
    return {};
  }
  const first = annotations[0];

  return {
    first_annotation_at: moment(first.created_at).format("YYYY-MM-DD hh:mm:ss"),
    first_annotation_by: first.createdBy ? first.createdBy.username : ""
  };
};

module.exports = {
  async exportStatusCSV(folderIds = []) {
    const columns = {
      id: "id",
      folder_id: "project_id",
      folder_name: "project_name",
      name: "image",
      status: "status",
      annotations: "annotations",
      first_annotation_at: "first_annotation_at_utc",
      first_annotation_by: "first_annotation_by",
      updated_at: "updated_at_utc",
      updated_by: "updated_by"
    };
    const images = (await models.image.findAll({
      attributes: ["id", "name", "status", "updated_at"],
      include: [
        {
          model: models.annotation,
          attributes: ["created_at"],
          include: [
            {
              model: models.user,
              attributes: ["id", "username"],
              as: "createdBy"
            }
          ]
        },
        {
          model: models.user,
          attributes: ["id", "username"],
          as: "updatedBy"
        },
        {
          model: models.folder,
          attributes: ["id", "name"]
        }
      ],
      where: {
        folder_id: {
          [models.Sequelize.Op.in]: folderIds
        }
      },
      order: [["folder_id", "ASC"], ["id", "ASC"]]
    })).map(image => ({
      id: image.id,
      folder_id: image.folder.id,
      folder_name: image.folder.name,
      name: image.name + ".jpg",
      status: image.status,
      annotations: image.annotations.length,
      ...firstAnnotation(image.annotations),
      updated_at: moment(image.updated_at).format("YYYY-MM-DD hh:mm:ss"),
      updated_by: image.updatedBy ? image.updatedBy.username : ""
    }));

    const stringifier = stringify(images, {
      header: true,
      columns
    });
    return stringifier;
  }
};
