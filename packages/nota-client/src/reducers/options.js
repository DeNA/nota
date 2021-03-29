import { SET_OPTIONS_ACTION } from "../actions";
import { OPTION_NOOP } from "../constants";

const KEY = "state.options";
const defaultState = {
  onCreate: OPTION_NOOP,
  zoomSensibility: 1,
  minScale: 0.5,
  maxScale: 12,
  maxScaleClick: 8
};
const savedState = {
  ...defaultState,
  ...(JSON.parse(window.localStorage.getItem(KEY)) || {})
};

export default (state = savedState, action, root) => {
  switch (action.type) {
    case SET_OPTIONS_ACTION:
      const newState = { ...state, ...action.options };
      window.localStorage.setItem(KEY, JSON.stringify(newState));

      return newState;
    default:
      return state;
  }
};
