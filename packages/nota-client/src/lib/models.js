export const Task = {
  STATUS: {
    DELETED: -100,
    UPDATING_ERROR: -2,
    CREATING_ERROR: -1,
    CREATING: 0,
    UPDATING: 1,
    HIDDEN: 50,
    READY: 100,
    DONE: 500
  },
  EXPORT_TARGET: {
    ALL: 1,
    NEW_AND_UPDATED: 2
  }
};
Task.STATUS_TEXT = {
  [Task.STATUS.DELETED]: "Deleted",
  [Task.STATUS.UPDATING_ERROR]: "Updating Error",
  [Task.STATUS.CREATING_ERROR]: "Crating Error",
  [Task.STATUS.CREATING]: "Creating",
  [Task.STATUS.UPDATING]: "Updating",
  [Task.STATUS.HIDDEN]: "Hidden",
  [Task.STATUS.READY]: "Ready",
  [Task.STATUS.DONE]: "Done"
};

export const TaskAssignment = {
  STATUS: {
    ERROR: -1,
    CREATING: 0,
    ANNOTATION_READY: 100,
    DONE: 500
  }
};

export const TaskItem = {
  STATUS: {
    NOT_DONE: 0,
    DONE: 1
  }
};

export const Annotation = {
  STATUS: {
    NOT_DONE: 0,
    DONE: 1
  }
};

export const User = {
  STATUS: {
    NOT_READY_DELETED: 0,
    // Can login, after that group permissions are used to determine scope
    ACTIVE: 1,
    // Can admin all projects and users
    SUPER_ADMIN: 10,
    // Can admin all projects and users, also can create projects and media sources
    APP_ADMIN: 20
  }
};

export const ProjectGroup = {
  TYPE: {
    ANNOTATOR: 100,
    PROJECT_ADMIN: 200
  }
};

export const Project = {
  USER_PERMISSION: {
    ANNOTATOR: 0,
    PROJECT_ADMIN: 10,
    SUPER_ADMIN: 20,
    APP_ADMIN: 30
  }
};

export const MediaSource = {
  STATUS: {
    UPDATING_ERROR: -2,
    CREATING_ERROR: -1,
    CREATING: 0,
    UPDATING: 1,
    HIDDEN: 50,
    READY: 100
  }
};
MediaSource.STATUS_TEXT = {
  [MediaSource.STATUS.UPDATING_ERROR]: "Updating Error",
  [MediaSource.STATUS.CREATING_ERROR]: "Creating Error",
  [MediaSource.STATUS.CREATING]: "Creating",
  [MediaSource.STATUS.UPDATING]: "Updating",
  [MediaSource.STATUS.HIDDEN]: "Hidden",
  [MediaSource.STATUS.READY]: "Ready"
};

export const MediaItemTag = {
  TYPE: {
    STRING: 1,
    INTEGER: 2,
    DATETIME: 3
  }
};

export const JobTask = {
  TYPE: {
    ADHOC: 1,
    SCHEDULED: 2
  },
  STATUS: {
    NOT_STARTED: 0,
    ONGOING: 1,
    OK: 10,
    ERROR: -1
  }
};
JobTask.TYPE_TEXT = {
  [JobTask.TYPE.ADHOC]: "adhoc",
  [JobTask.TYPE.SCHEDULED]: "scheduled"
};
JobTask.STATUS_TEXT = {
  [JobTask.STATUS.NOT_STARTED]: "Not started",
  [JobTask.STATUS.ONGOING]: "Ongoing",
  [JobTask.STATUS.OK]: "Finished",
  [JobTask.STATUS.ERROR]: "Error"
};
