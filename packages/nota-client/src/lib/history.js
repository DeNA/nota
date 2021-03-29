import { createBrowserHistory as createHistory } from "history";
import { matchPath } from "react-router";

const history = createHistory();

export const getParamFromPath = function(param, path) {
  const match = matchPath(history.location.pathname, {
    path,
    exact: false,
    strict: false
  });

  return (match && match.params && match.params[param]) || null;
};

export default history;
