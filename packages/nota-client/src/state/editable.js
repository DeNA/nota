import { fetchTaskAssignmentActions } from "./taskAssignment";

// REDUCERS
export const editableReducer = function(state = false, action, root) {
  switch (action.type) {
    case fetchTaskAssignmentActions.ACTION_SUCCEED:
      return action.response.editable;
    default:
      return state;
  }
};
