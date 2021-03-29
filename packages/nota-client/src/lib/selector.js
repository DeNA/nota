let current = null;
let results = {};
const queries = {};

const hashCode = function(str) {
  return str
    .split("")
    .reduce(
      (prevHash, currVal) => (prevHash << 5) - prevHash + currVal.charCodeAt(0),
      0
    );
};

export const selector = function(db) {
  const setQuery = (queryName, action) => {
    delete results[queryName];
    delete queries[queryName];

    action && (queries[queryName] = action);
  };

  const setDb = db => {
    if (current !== db) {
      current = db;
      results = {};
    }
  };

  const select = (queryName, ...args) => {
    const query = queries[queryName];

    if (!query) {
      throw new Error(`${queryName} is not a registered query`);
    }

    const key = `${queryName}@@@${hashCode(JSON.stringify(args))}`;
    const result = results[key] || query(current, select, ...args);
    results[key] = result;

    return result;
  };

  setDb(db);

  return {
    setDb,
    select,
    setQuery
  };
};
