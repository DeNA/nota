import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { applyMiddleware, compose, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import "semantic-ui-css/semantic.css";
import notaStore from "../../../reducers";
import notaSaga from "../../../sagas";
import { registerSelectors } from "../../../selectors/registerSelectors";
import AnnotationMain from "./AnnotationMain";

const AnnotationMainWrap = function() {
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(
    notaStore,
    composeEnhancers(applyMiddleware(sagaMiddleware))
  );

  sagaMiddleware.run(notaSaga);

  registerSelectors();

  if (module.hot) {
    module.hot.accept("../../../reducers", () => {
      const nextRootReducer = require("../../../reducers");
      store.replaceReducer(nextRootReducer);
    });
    module.hot.accept("./AnnotationMain.js", () => {
      const NextAnnotationMain = require("./AnnotationMain.js").default;
      render(
        <Provider store={store}>
          <NextAnnotationMain />
        </Provider>,
        document.getElementById("root")
      );
    });
  }

  return (
    <Provider store={store}>
      <AnnotationMain />
    </Provider>
  );
};

export default AnnotationMainWrap;
