import { SET_OPTIONS_ACTION } from "../actions";
import { OPTION_NOOP } from "../constants";

const KEY = "state.options";
const defaultState = {
  onCreate: OPTION_NOOP,
  zoomSensibility: 1,
  minScale: 0.5,
  maxScale: 12,
  maxScaleClick: 8,
  timelineZoom: 1,
  timelineVisState: {}
};

export default (
  state = {
    ...defaultState,
    ...(JSON.parse(window.localStorage.getItem(KEY)) || {})
  },
  action,
  root
) => {
  switch (action.type) {
    case SET_OPTIONS_ACTION:
      const { timelineVisState = {}, ...options } = action.options;
      const newTimelineVisState = {
        ...state.timelineVisState,
        ...timelineVisState
      };
      const newState = {
        ...state,
        ...options,
        timelineVisState: newTimelineVisState
      };

      window.localStorage.setItem(KEY, JSON.stringify(newState));

      return newState;
    default:
      return state;
  }
};
