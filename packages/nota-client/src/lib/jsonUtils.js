export const validateJSON = json => {
  try {
    JSON.parse(json);
  } catch (err) {
    return err;
  }

  return true;
};

export const prettifyJSON = json => {
  if (!json) {
    return "";
  }

  return JSON.stringify(JSON.parse(json), null, 2);
};

export const trimJSON = json => {
  if (!json) {
    return "";
  }

  return JSON.stringify(JSON.parse(json));
};
