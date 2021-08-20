const cache = {};
const cacheKeys = [];
const MAX_CACHE_SIZE = 100;

export const get = function(key) {
  return cache[key];
};

export const add = function(key, value) {
  if (cache[key] === undefined) {
    cacheKeys.push(key);
  }
  cache[key] = value;

  while (cacheKeys.length > MAX_CACHE_SIZE) {
    const oldKey = cacheKeys.shift();
    delete cache[oldKey];
  }
};

export const remove = function(key) {
  delete cache[key];
};
