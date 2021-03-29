/** @type {string} */
export const SET_OPTIONS_ACTION = "SET_OPTIONS_ACTION";

/**
 * @param {object} options
 * @return {Nota.setOptionsAction}
 */
export function setOptions(options) {
  return { type: SET_OPTIONS_ACTION, options };
}
