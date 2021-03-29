import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Redirect, Route, Switch } from "react-router-dom";
import { fetchProject } from "../../lib/api";
import { apiContainerFactory } from "../../lib/apiContainerFactory";
import { parseDate } from "../../lib/utils";
import Loading from "../Loading";
import MeContext from "../MeContext";
import AdminProjectEdit from "./AdminProjectEdit";
import AdminProjectGroups from "./AdminProjectGroups";
import AdminProjectMediaSource from "./AdminProjectMediaSource";
import AdminProjectMediaSourceEdit from "./AdminProjectMediaSourceEdit";
import AdminProjectMediaSourceNew from "./AdminProjectMediaSourceNew";
import AdminProjectMediaSources from "./AdminProjectMediaSources";
import AdminProjectTask from "./AdminProjectTask";
import AdminProjectTaskEdit from "./AdminProjectTaskEdit";
import AdminProjectTaskNew from "./AdminProjectTaskNew";
import AdminProjectTasks from "./AdminProjectTasks";
import AdminProjectTemplateEdit, {
  AdminProjectTemplate
} from "./AdminProjectTemplate";
import AdminProjectTemplates from "./AdminProjectTemplates";

export function AdminProjectMain({
  resource: project,
  loading,
  doGet,
  params,
  reloadProjectsList
}) {
  const me = React.useContext(MeContext);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Container fluid className="h-100">
        <Row className="pt-3 p-2">
          <Col className="d-flex align-items-center">
            <div>
              <h2>{project.name}</h2>
            </div>
            <div className="d-flex justify-content-center align-items-center ml-2">
              <div>
                <LinkContainer to={`/admin/projects/${project.id}/edit`}>
                  <Button size="sm" variant="outline-info">
                    Edit
                  </Button>
                </LinkContainer>
              </div>
            </div>
          </Col>
          <Col className="d-flex flex-column align-items-end">
            <div>
              <small>
                Created by: {project.createdBy.username} (
                {parseDate(project.createdAt)})
              </small>
            </div>
            <div>
              <small>
                Updated by: {project.updatedBy.username} (
                {parseDate(project.updatedAt)})
              </small>
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <Switch>
              <Route
                exact
                path="/admin/projects/:projectId"
                render={props => (
                  <AdminProjectTasks {...props} project={project} />
                )}
              />
              <Route
                exact
                path="/admin/projects/:projectId/edit"
                render={props => (
                  <AdminProjectEdit
                    {...props}
                    project={project}
                    reloadProjectsList={reloadProjectsList}
                  />
                )}
              />
              <Route
                exact
                path="/admin/projects/:projectId/tasks/new"
                render={props => (
                  <AdminProjectTaskNew {...props} project={project} />
                )}
              />
              <Route
                exact
                path="/admin/projects/:projectId/tasks/:taskId"
                render={props => (
                  <AdminProjectTask {...props} project={project} />
                )}
              />
              <Route
                exact
                path="/admin/projects/:projectId/tasks/:taskId/edit"
                render={props => (
                  <AdminProjectTaskEdit {...props} project={project} />
                )}
              />
              <Route
                exact
                path="/admin/projects/:projectId/taskTemplates"
                render={props => (
                  <AdminProjectTemplates {...props} project={project} />
                )}
              />
              <Route
                exact
                path="/admin/projects/:projectId/taskTemplates/new"
                render={props => (
                  <AdminProjectTemplate {...props} isNew project={project} />
                )}
              />
              <Route
                exact
                path="/admin/projects/:projectId/taskTemplates/:taskTemplateId"
                render={props => (
                  <AdminProjectTemplateEdit {...props} project={project} />
                )}
              />
              <Route
                exact
                path="/admin/projects/:projectId/groups"
                render={props => (
                  <AdminProjectGroups
                    {...props}
                    project={project}
                    reload={() => doGet(params)}
                  />
                )}
              />
              <Route
                exact
                path="/admin/projects/:projectId/mediaSources"
                render={props => (
                  <AdminProjectMediaSources {...props} project={project} />
                )}
              />
              {me.isAppAdmin && (
                <Route
                  exact
                  path="/admin/projects/:projectId/mediaSources/new"
                  render={props => (
                    <AdminProjectMediaSourceNew {...props} project={project} />
                  )}
                />
              )}
              <Route
                exact
                path="/admin/projects/:projectId/mediaSources/:mediaSourceId"
                render={props => (
                  <AdminProjectMediaSource {...props} project={project} />
                )}
              />
              <Route
                exact
                path="/admin/projects/:projectId/mediaSources/:mediaSourceId/edit"
                render={props => (
                  <AdminProjectMediaSourceEdit {...props} project={project} />
                )}
              />
              <Redirect to={`/admin/projects/${project.id || ""}`} />
            </Switch>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default apiContainerFactory(AdminProjectMain, fetchProject);
