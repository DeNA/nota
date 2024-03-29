import "bootstrap/dist/css/bootstrap.css";
import React from "react";
import { Suspense } from "react";
import { Route, Router, Switch } from "react-router-dom";
import Login from "../containers/LoginContainer";
import asyncComponent from "../lib/AsyncComponent";
import history from "../lib/history";
import AnnotationMain from "./annotation/containers/AnnotationMainWrap";
import Logout from "./Logout";
import "./Main.css";
const Main = asyncComponent(() => import("./Main"));

const App = () => {
  return (
    <Suspense fallback="loading...">
      <Router history={history}>
        <Switch>
          <Route exact path="/login" component={Login} />
          <Route exact path="/logout" component={Logout} />
          <Route
            exact
            path="/annotation/:projectId/:taskId/:taskAssignmentId"
            component={AnnotationMain}
          />
          <Route
            exact
            path="/annotation/:projectId/:taskId/:taskAssignmentId/:taskItemId"
            component={AnnotationMain}
          />
          <Route path="/" component={Main} />
        </Switch>
      </Router>
    </Suspense>
  );
};

export default App;
