const archiver = require("archiver");

const prepareArchive = async function(mediaItems) {
  const archive = archiver("tar", {
    gzip: true
  });

  for (const [parsedFileName, parsedFile] of mediaItems) {
    archive.append(parsedFile, { name: parsedFileName });
  }

  archive.finalize();

  return archive;
};

const archiveAwait = async function(archive) {
  return new Promise((resolve, reject) => {
    archive.on("error", err => {
      reject(err);
    });

    archive.on("end", () => {
      resolve(true);
    });
  });
};

const writeArchives = async function(archives, ds) {
  const written = [];

  for await (const [name, archive] of archives) {
    const response = await Promise.all([
      archiveAwait(archive),
      ds.writeItem(archive, { fileName: name })
    ]);

    written.push(response[1]);
  }
  return written;
};

module.exports = {
  prepareArchive,
  writeArchives
};
