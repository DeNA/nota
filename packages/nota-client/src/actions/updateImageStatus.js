/** @type {string} */
export const UPDATE_IMAGE_STATUS = "UPDATE_IMAGE_STATUS";

/** @type {string} */
export const UPDATE_IMAGE_STATUS_SUCCEED = "UPDATE_IMAGE_STATUS_SUCCEED";

/** @type {string} */
export const UPDATE_IMAGE_STATUS_ERROR = "UPDATE_IMAGE_STATUS_ERROR";

/**
 * @param {Nota.Image} image
 * @return {Nota.updateImageStatusAction}
 */
export function updateImageStatus(image) {
  return { type: UPDATE_IMAGE_STATUS, image };
}

/**
 * @param {Nota.Image} image
 * @return {Nota.updateImageStatusSucceedAction}
 */
export function updateImageStatusSucceed(image) {
  return { type: UPDATE_IMAGE_STATUS_SUCCEED, image };
}

/**
 * @param {Nota.Error} error
 * @return {Nota.updateImageStatusErrorAction}
 */
export function updateImageStatusError(error) {
  return { type: UPDATE_IMAGE_STATUS_ERROR, error };
}
