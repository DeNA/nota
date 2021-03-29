import { CHANGE_IMAGE_FILTERS } from "../actions";

const defaultFilters = {
  brightness: 0
};

export default (state = defaultFilters, action, root) => {
  switch (action.type) {
    case CHANGE_IMAGE_FILTERS:
      return { ...state, ...action.filters };
    default:
      return state;
  }
};
