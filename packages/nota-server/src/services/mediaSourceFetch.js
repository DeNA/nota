const { MediaSource } = require("../models");

const mediaSourceFetch = async function(jobTask, done) {
  const mediaSourceId = jobTask.resourceId;
  const data = jobTask.config.data;
  const userId = jobTask.createdBy;

  if (!mediaSourceId || !userId) {
    throw new Error("mediaSourceId and userId are required");
  }
  const mediaSource = await MediaSource.findByPk(mediaSourceId);
  const added = await mediaSource.fetchMediaItems(data.refresh);

  if (data.refresh) {
    mediaSource.updatedBy = userId;
    await mediaSource.save();
  }

  done({ added });
};

module.exports = mediaSourceFetch;
