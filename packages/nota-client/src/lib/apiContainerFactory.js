import React from "react";
import { withRouter } from "react-router";

const START_GET = "START_GET";
const END_GET = "END_GET";

const doGet = async (getApi, dispatch, params = {}) => {
  dispatch({ type: START_GET });
  const result = await getApi(params);
  dispatch({ type: END_GET, resource: result });
};

const reducer = function(state, action) {
  switch (action.type) {
    case START_GET:
      return { ...state, loading: true };
    case END_GET:
      return { loading: false, resource: action.resource };
    default:
      throw new Error();
  }
};

export const apiContainerFactory = function(ResourceView, getApi) {
  const ApiContainerFactory = function({
    match: { params = {} } = { params: {} },
    ...props
  }) {
    const [state, dispatch] = React.useReducer(reducer, {
      loading: true,
      resource: null
    });
    const prevParams = React.useRef("");

    // Pre-fetch
    React.useEffect(() => {
      if (JSON.stringify(params) !== prevParams.current) {
        prevParams.current = JSON.stringify(params);
        doGet(getApi, dispatch, params);
      }
    }, [params]);

    return (
      <ResourceView
        {...props}
        loading={props.loading || state.loading}
        resource={state.resource}
        doGet={params => doGet(getApi, dispatch, params)}
        params={params}
      />
    );
  };

  return withRouter(ApiContainerFactory);
};
