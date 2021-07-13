import React from "react";
import { Col, Nav, Row, Button, Container } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Route, Switch } from "react-router-dom";
import { fetchProjects } from "../../lib/api";
import { apiContainerFactory } from "../../lib/apiContainerFactory";
import { getParamFromPath } from "../../lib/history";
import Loading from "../Loading";
import AdminProjectMain from "./AdminProjectMain";
import MeContext from "../MeContext";
import AdminProjectNew from "./AdminProjectNew";
import { useTranslation } from "react-i18next";

export function AdminProjects({ resource: projects, loading, doGet }) {
  const { t } = useTranslation();
  const me = React.useContext(MeContext);
  if (loading) {
    return <Loading global />;
  }

  const projectId = parseInt(
    getParamFromPath("projectId", "/admin/projects/:projectId")
  );

  return (
    <Container fluid className="h-100">
      <Row className="h-100">
        <Col md="auto" className="border-right p-0" style={{ minWidth: 200 }}>
          <Container fluid className="h-100">
            <Row className="h-100">
              <Col className="d-flex flex-column p-0 h-100 justify-content-between">
                <Nav className="flex-column text-light">
                  {projects.map(project => (
                    <React.Fragment key={project.id}>
                      <Nav.Item
                        className={`${
                          projectId === project.id ? "bg-info shadow-sm" : ""
                        }`}
                      >
                        <LinkContainer to={`/admin/projects/${project.id}`}>
                          <Nav.Link className="text-light">
                            {project.name}
                          </Nav.Link>
                        </LinkContainer>
                      </Nav.Item>
                      {projectId === project.id && (
                        <Nav
                          className="flex-column pl-2"
                          style={{ backgroundColor: "rgba(0,0,0,0.1)" }}
                        >
                          <Nav.Item>
                            <LinkContainer to={`/admin/projects/${project.id}`}>
                              <Nav.Link className="text-white-50">
                                {t("tasks")}
                              </Nav.Link>
                            </LinkContainer>
                          </Nav.Item>
                          <Nav.Item>
                            <LinkContainer
                              to={`/admin/projects/${project.id}/taskTemplates`}
                            >
                              <Nav.Link className="text-white-50">
                                {t("templates")}
                              </Nav.Link>
                            </LinkContainer>
                          </Nav.Item>
                          <Nav.Item>
                            <LinkContainer
                              to={`/admin/projects/${project.id}/mediaSources`}
                            >
                              <Nav.Link className="text-white-50">
                                {t("media-sources")}
                              </Nav.Link>
                            </LinkContainer>
                          </Nav.Item>
                          <Nav.Item>
                            <LinkContainer
                              to={`/admin/projects/${project.id}/groups`}
                            >
                              <Nav.Link className="text-white-50">
                                {t("permission-groups")}
                              </Nav.Link>
                            </LinkContainer>
                          </Nav.Item>
                        </Nav>
                      )}
                    </React.Fragment>
                  ))}
                </Nav>
                {me.isAppAdmin && (
                  <div className="d-flex justify-content-center pb-2">
                    <LinkContainer to={`/admin/projects/new`}>
                      <Button variant="outline-success">
                        {t("new-project")}
                      </Button>
                    </LinkContainer>
                  </div>
                )}
              </Col>
            </Row>
          </Container>
        </Col>
        <Col className="h-100 pl-0 shadow bg-light">
          <Switch>
            {me.isAppAdmin && (
              <Route
                exact
                path="/admin/projects/new"
                render={props => (
                  <AdminProjectNew {...props} reloadProjectsList={doGet} />
                )}
              />
            )}
            <Route
              path="/admin/projects/:projectId"
              render={props => (
                <AdminProjectMain {...props} reloadProjectsList={doGet} />
              )}
            />
          </Switch>
        </Col>
      </Row>
    </Container>
  );
}

export default apiContainerFactory(AdminProjects, fetchProjects);
