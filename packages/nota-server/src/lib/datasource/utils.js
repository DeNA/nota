const path = require("path");

const isSubdir = function(root, subpath) {
  if (root === subpath) return true;

  const relative = path.posix.relative(root, subpath);
  const isSubdir =
    relative && !relative.startsWith("..") && !path.isAbsolute(relative);

  return isSubdir;
};

const absolutePath = function(
  root,
  paths = [],
  trailingSlash = false,
  rootSlash = true
) {
  const joinedRoot = path.posix.join("/", root, "/");
  const normalizedRoot = path.posix.normalize(joinedRoot);
  const joined = path.posix.join(
    normalizedRoot,
    ...paths,
    trailingSlash ? "/" : ""
  );
  const normalized = path.posix.normalize(joined);

  if (!isSubdir(normalizedRoot, normalized)) {
    throw new Error(
      `Invalid path. ${normalized} is not a subdir of ${normalizedRoot}`
    );
  }

  if (rootSlash) {
    return normalized;
  } else {
    return normalized.substring(1);
  }
};

module.exports = {
  absolutePath
};
