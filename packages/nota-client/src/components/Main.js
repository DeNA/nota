import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { Route, Switch } from "react-router-dom";
import { fetchMe } from "../lib/api";
import { apiContainerFactory } from "../lib/apiContainerFactory";
import AdminMain from "./admin/AdminMain";
import Dashboard from "./Dashboard";
import Loading from "./Loading";
import NavigationBar from "./NavigationBar";
import MeContext from "./MeContext";

export function Main({ resource: me, loading }) {
  if (loading) {
    return <Loading />;
  }

  return (
    <MeContext.Provider value={me}>
      <NavigationBar
        username={me.username}
        showAdmin={me.isProjectAdmin}
        showUserAdmin={me.isSuperAdmin}
        showReport={me.isSuperAdmin}
      />
      <Container fluid className="content-container h-100">
        <Row className="h-100" style={{ paddingTop: 47 }}>
          <Col className="p-0 bg-secondary">
            <Switch>
              <Route path="/admin" component={AdminMain} />
              <Route path="/" component={Dashboard} />
            </Switch>
          </Col>
        </Row>
      </Container>
    </MeContext.Provider>
  );
}

export default apiContainerFactory(Main, fetchMe);
