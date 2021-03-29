export const IMAGE_STATUS_ONGOING = 0;
export const IMAGE_STATUS_DONE = 1;

export const ANNOTATION_LINE_WIDTH = 2;
export const ANNOTATION_DRAGLINE_WIDTH = 30;

export const GROUP_ADMIN = "admin";
export const GROUP_USER = "user";

export const GROUP_OPTIONS = [
  { key: "user", text: "User", value: "user" },
  { key: "admin", text: "Admin", value: "admin" }
];

export const FOLDER_STATUS = {
  0: "CREATING",
  50: "ERROR",
  100: "READY",
  200: "HIDDEN"
};

/** Flow Options */
export const OPTION_NOOP = "none";
export const OPTION_FOCUS = "focus";
export const OPTION_POPUP_FOCUS = "popup_focus";
export const OPTION_LABEL_SHOW_OFF = "label_show_off";
export const OPTION_LABEL_SHOW_HOVER = "label_show_hover";
export const OPTION_LABEL_SHOW_ALWAYS = "label_show_always";

export const ACTION_SELECT_ANNOTATION = "select_annotation";
export const ACTION_SELECT_ANNOTATION_USER = "select_annotation_user";
export const ACTION_CREATE_ANNOTATION = "create_annotation";

export const MEDIA_TYPE = {
  IMAGE: "IMAGE",
  VIDEO: "VIDEO"
};

export const DEFAULT_ANNOTATION_COLOR = "rgba(200,255,100,1)";
export const DEFAULT_SELECTED_ANNOTATION_COLOR = "rgba(200,255,100,1)";
