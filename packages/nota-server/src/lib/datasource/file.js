const fs = require("fs-extra");
const { absolutePath } = require("./utils");

const listFolderResources = async function({ id, path }, subdir) {
  const fullPath = absolutePath(path, [subdir], true);
  const dirFiles = await fs.readdir(fullPath);
  const dirs = [];
  const files = [];

  for (const file of dirFiles) {
    const fileStat = await fs.stat(absolutePath(fullPath, [file]));

    if (fileStat.isDirectory()) {
      dirs.push({
        pathId: id,
        file: file
      });
    } else {
      files.push({
        pathId: id,
        file: file
      });
    }
  }

  return [dirs, files];
};

const listResources = async function({ importPaths = null }, ...args) {
  if (!importPaths || !importPaths.length) {
    throw new Error("importPaths is required");
  }

  let dirs = [];

  for (const importPath of importPaths) {
    dirs = dirs.concat(await listFolderResources(importPath, ...args));
  }

  return dirs;
};

const readDirFilesRecursive = async function(root, path, importPathId) {
  const dirFiles = await fs.readdir(absolutePath(root, [path]));
  let files = [];

  for (const file of dirFiles) {
    const fileFullPath = absolutePath(root, [path, file]);
    const fileStat = await fs.stat(fileFullPath);

    if (fileStat.isFile()) {
      files.push({
        name: file,
        metadata: {
          importPathId: importPathId,
          resource: path,
          fileName: file
        }
      });
    } else if (fileStat.isDirectory()) {
      files = files.concat(
        await readDirFilesRecursive(
          root,
          absolutePath(path, [file], false, false),
          importPathId
        )
      );
    }
  }

  return files;
};

const listItems = async function({ importPaths = null }, { resource = null }) {
  if (!importPaths || !importPaths.length || !resource) {
    throw new Error("importPaths and resource are required");
  }

  const importPath = importPaths.find(
    importPath => importPath.id === resource.pathId
  );

  if (!importPath) {
    throw new Error(`importPath ${resource.pathId} not configured`);
  }

  const files = await readDirFilesRecursive(
    importPath.path,
    resource.file,
    importPath.id
  );

  const prefix = absolutePath("", [resource.file], true, false);

  return files.map(file => {
    file.metadata.resource = file.metadata.resource.substring(prefix.length);
    return file;
  });
};

const statItem = async function({ importPaths }, { metadata = {} }) {
  if (!importPaths || !importPaths.length || !metadata.importPathId) {
    throw new Error("importPaths and metadata are required");
  }

  const importPath = importPaths.find(
    importPath => importPath.id === metadata.importPathId
  );

  if (!importPath) {
    throw new Error(`importPath ${metadata.importPathId} not configured`);
  }

  const fullPath = absolutePath(importPath.path, [
    metadata.resource,
    metadata.fileName
  ]);

  try {
    const stat = await fs.stat(fullPath);

    return { size: stat.size };
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
};

const readItem = async function(
  { importPaths },
  { metadata = {}, start, end }
) {
  if (!importPaths || !importPaths.length || !metadata.importPathId) {
    throw new Error("importPaths and metadata are required");
  }

  const importPath = importPaths.find(
    importPath => importPath.id === metadata.importPathId
  );

  if (!importPath) {
    throw new Error(`importPath ${metadata.importPathId} not configured`);
  }

  const fullPath = absolutePath(importPath.path, [
    metadata.resource,
    metadata.fileName
  ]);

  const options = {};

  if (start) {
    options.start = start;
  }

  if (end) {
    options.end = end;
  }

  return fs.createReadStream(fullPath, options);
};

const writeItem = async function({ exportPath }, item, { fileName }) {
  if (!exportPath || !fileName) {
    throw new Error("exportPath, fileName are required");
  }

  const fullPath = `${exportPath}/${fileName}`;
  const out = fs.createWriteStream(fullPath);
  item.pipe(out);

  return fullPath;
};

const getDownloadUrl = async function({}, { fileName }) {
  if (!fileName) {
    throw new Error("fileName is required");
  }

  throw new Error("Not Implemented");
};

module.exports = {
  listResources,
  listItems,
  statItem,
  readItem,
  writeItem,
  getDownloadUrl
};
