export const createAsyncAction = function(actionName) {
  const ACTION = actionName;
  const ACTION_SUCCEED = `${actionName}_SUCCEED`;
  const ACTION_ERROR = `${actionName}_ERROR`;

  const action = function(request, ...args) {
    return { type: ACTION, request, ...args };
  };
  const actionSucceed = function(response, ...args) {
    return { type: ACTION_SUCCEED, response, ...args };
  };
  const actionError = function(error, ...args) {
    return { type: ACTION_ERROR, error, ...args };
  };

  return {
    action,
    actionSucceed,
    actionError,
    ACTION,
    ACTION_SUCCEED,
    ACTION_ERROR
  };
};

export const createAsyncReducer = function(actions, defaultValue) {
  const reducer = function(
    state = { loading: true, data: defaultValue, error: null },
    action,
    root
  ) {
    switch (action.type) {
      case actions.ACTION:
        return {
          ...state,
          loading: true,
          error: null
        };
      case actions.ACTION_SUCCEED:
        return {
          data: action.response,
          loading: false,
          error: null
        };
      case actions.ACTION_ERROR:
        return {
          data: defaultValue,
          loading: false,
          error: action.error
        };
      default:
        return state;
    }
  };

  return reducer;
};
