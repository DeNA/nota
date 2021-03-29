import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import AdminProjects from "./AdminProjects";
import AdminUsers from "./AdminUsers";
import MeContext from "../MeContext";
import AdminReportMain from "./AdminReportMain";

function Admin() {
  const me = React.useContext(MeContext);

  return (
    <Switch>
      {me.isSuperAdmin && <Route path="/admin/users" component={AdminUsers} />}
      {me.isSuperAdmin && (
        <Route path="/admin/report" component={AdminReportMain} />
      )}
      {me.isProjectAdmin && <Route path="/admin" component={AdminProjects} />}
      <Redirect to="/" />
    </Switch>
  );
}

export default Admin;
