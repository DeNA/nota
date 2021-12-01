const IMAGE_DONE = 1;

const parser = {
  serialize: taskItem => {
    const { status, annotations = [], mediaItem, notaUrl } = taskItem;
    const path = mediaItem.path;
    const name = mediaItem.name;
    const height = mediaItem.metadata.size
      ? mediaItem.metadata.size.height
      : undefined;
    const width = mediaItem.metadata.size
      ? mediaItem.metadata.size.width
      : undefined;

    const json = {
      image: {
        path,
        name,
        width,
        height,
        notaUrl
      },
      metadata: mediaItem.metadata.externalMetadata || undefined,
      done: status === IMAGE_DONE ? true : false,
      annotations: annotations.map(
        ({ boundaries, labels = {}, labelsName }) => {
          return {
            labels,
            boundaries,
            type: labelsName
          };
        }
      )
    };

    return [`${name}.json`, JSON.stringify(json, null, 2)];
  },
  parse: json => {
    const annotations = (json.annotations || []).map(
      ({ boundaries, type, labels = {} }) => ({
        boundaries,
        labelsName: type,
        labels
      })
    );
    const image = { annotations };

    return image;
  }
};

module.exports = parser;
