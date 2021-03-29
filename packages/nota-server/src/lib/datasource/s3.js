const aws = require("aws-sdk");
const stream = require("stream");
const { absolutePath } = require("./utils");

const setupS3 = function(auth) {
  const config = { apiVersion: "2006-03-01", signatureVersion: "v4" };

  if (auth) {
    const { accessKeyId, secretAccessKey, region } = auth;
    config.accessKeyId = accessKeyId;
    config.secretAccessKey = secretAccessKey;
    config.region = region;
  }

  return new aws.S3(config);
};

const listFolderResources = async function(
  s3,
  bucket,
  { id, path = "" },
  subdir
) {
  const fullPath = absolutePath(path, [subdir], true, false);
  return new Promise((resolve, reject) => {
    s3.listObjectsV2(
      {
        Bucket: bucket,
        Delimiter: "/",
        Prefix: fullPath
      },
      (err, data) => {
        if (err) {
          return reject(err);
        }

        const dirs = (data.CommonPrefixes || [])
          .map(prefix => ({
            pathId: id,
            file: prefix.Prefix.substring(
              fullPath.length,
              prefix.Prefix.length - 1
            )
          }))
          .filter(dir => dir.file);
        const files = (data.Contents || []).map(file => ({
          pathId: id,
          file: file.Key
        }));

        resolve([dirs, files]);
      }
    );
  });
};

const listResources = async function(
  { importPaths = null, auth, bucket },
  ...args
) {
  if (!importPaths || !importPaths.length || !bucket) {
    throw new Error("importPath and bucket are required");
  }

  const s3 = setupS3(auth);
  let dirs = [];

  for (const importPath of importPaths) {
    dirs = dirs.concat(
      await listFolderResources(s3, bucket, importPath, ...args)
    );
  }

  return dirs;
};

const listLocationItems = async function(s3, bucket, prefix) {
  let files = [];

  return new Promise((resolve, reject) => {
    const getNext = (err, data) => {
      if (err) {
        return reject(err);
      }

      if (data.Contents) {
        const resources = data.Contents.map(file => file.Key);
        files = files.concat(resources);
      }

      if (data.NextContinuationToken) {
        s3.listObjectsV2(
          {
            Bucket: bucket,
            Prefix: prefix,
            ContinuationToken: data.NextContinuationToken
          },
          getNext
        );
      } else {
        resolve(files);
      }
    };

    s3.listObjectsV2(
      {
        Bucket: bucket,
        Prefix: prefix
      },
      getNext
    );
  });
};

const listItems = async function(
  { bucket, importPaths = null, auth },
  { resource = null }
) {
  if (!importPaths || !importPaths.length || !resource || !bucket) {
    throw new Error("importPaths and resource and bucket are required");
  }

  const importPath = importPaths.find(
    importPath => importPath.id === resource.pathId
  );

  if (!importPath) {
    throw new Error(`importPath ${resource.pathId} not configured`);
  }

  const s3 = setupS3(auth);
  const prefix = absolutePath(
    importPath.path || "",
    [resource.file],
    true,
    false
  );
  const files = await listLocationItems(s3, bucket, prefix);

  return files.map(file => {
    const pathWithoutPrefix = file.substring(prefix.length);
    const [fileName, ...pathFolders] = pathWithoutPrefix.split("/").reverse();
    const resource = absolutePath("", pathFolders.reverse(), false, false);
    return {
      name: fileName,
      metadata: {
        importPathId: importPath.id,
        resource,
        fileName: fileName
      }
    };
  });
};

const statItem = async function(
  { bucket, importPaths = null, auth },
  { metadata = {} }
) {
  if (
    !importPaths ||
    !importPaths.length ||
    !bucket ||
    !metadata.importPathId
  ) {
    throw new Error("importPaths and bucket and metadata are required");
  }

  const importPath = importPaths.find(
    importPath => importPath.id === metadata.importPathId
  );

  if (!importPath) {
    throw new Error(`importPath ${metadata.importPathId} not configured`);
  }

  const s3 = setupS3(auth);
  const fullPath = absolutePath(
    importPath.path || "",
    [metadata.resource, metadata.fileName],
    false,
    false
  );

  try {
    const stat = await s3
      .headObject({
        Bucket: bucket,
        Key: fullPath
      })
      .promise();

    return { size: stat.ContentLength };
  } catch (error) {
    if (error.code === "NotFound") {
      return null;
    }
    throw error;
  }
};

const readItem = async function(
  { bucket, importPaths = null, auth },
  { metadata = {}, range }
) {
  if (
    !importPaths ||
    !importPaths.length ||
    !bucket ||
    !metadata.importPathId
  ) {
    throw new Error("importPaths and bucket and metadata are required");
  }

  const importPath = importPaths.find(
    importPath => importPath.id === metadata.importPathId
  );

  if (!importPath) {
    throw new Error(`importPath ${metadata.importPathId} not configured`);
  }

  const s3 = setupS3(auth);
  const fullPath = absolutePath(
    importPath.path || "",
    [metadata.resource, metadata.fileName],
    false,
    false
  );

  return new Promise(async (resolve, reject) => {
    const stream = s3
      .getObject({
        Bucket: bucket,
        Key: fullPath,
        Range: range || undefined
      })
      .createReadStream();

    resolve(stream);
  });
};

const writeItem = async function(
  { bucket, exportPath = "", auth },
  item,
  { fileName }
) {
  if (!bucket || !fileName) {
    throw new Error("bucket and fileName are required");
  }

  const s3 = setupS3(auth);
  const fullPath = absolutePath(exportPath, [fileName], false, false);
  let itemBuffer = new Buffer("");
  const passThrough = new stream.PassThrough();

  for await (const chunk of item.pipe(passThrough)) {
    itemBuffer = Buffer.concat([itemBuffer, chunk]);
  }

  await s3
    .putObject({
      Bucket: bucket,
      Key: fullPath,
      ACL: "bucket-owner-full-control",
      Body: itemBuffer
    })
    .promise();

  return fullPath;
};

const getDownloadUrl = async function({ bucket, auth }, { fileName }) {
  if (!bucket || !fileName) {
    throw new Error("bucket and fileName are required");
  }

  const s3 = setupS3(auth);
  const fullPath = absolutePath("", [fileName], false, false);

  return new Promise(async (resolve, reject) => {
    const url = await s3.getSignedUrlPromise("getObject", {
      Bucket: bucket,
      Key: fullPath,
      Expires: 30
    });

    resolve(url);
  });
};

module.exports = {
  listResources,
  listItems,
  statItem,
  readItem,
  writeItem,
  getDownloadUrl
};
