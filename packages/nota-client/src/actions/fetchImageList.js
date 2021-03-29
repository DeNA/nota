/** @type {string} */
export const FETCH_IMAGE_LIST_SUCCEED = "FETCH_IMAGE_LIST_SUCCEED";

/**
 * @param {Nota.Image[]} imageList
 * @return {Nota.fetchImageListSucceedAction}
 */
export function fetchImageListSucceed(imageList) {
  return { type: FETCH_IMAGE_LIST_SUCCEED, imageList };
}
