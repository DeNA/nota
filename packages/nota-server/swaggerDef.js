module.exports = {
  info: {
    // API informations (required)
    title: "Nota", // Title (required)
    version: "1.0.0", // Version (required)
    description: "Nota API definition" // Description (optional)
  },
  apis: ["src/routes/*.js", "src/routes/*.yml"],
  basePath: "/" // Base path (optional)
};
