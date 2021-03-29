/** @type {string} */
export const CHANGE_IMAGE_FILTERS = "CHANGE_IMAGE_FILTERS";

/**
 * @param {object} filters
 * @return {Nota.changeImageFiltersAction}
 */
export function changeImageFilters(filters) {
  return { type: CHANGE_IMAGE_FILTERS, filters };
}
