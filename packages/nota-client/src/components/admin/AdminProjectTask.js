import React from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  ListGroup,
  Nav,
  ProgressBar,
  Row
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";
import { fetchProjectAssignableUsers, fetchTask } from "../../lib/api";
import { apiContainerFactory } from "../../lib/apiContainerFactory";
import { Project, Task, TaskAssignment } from "../../lib/models";
import { parseDate } from "../../lib/utils";
import Loading from "../Loading";
import AdminProjectTaskAssignment from "./AdminProjectTaskAssignment";
import AdminProjectTaskExport from "./AdminProjectTaskExport";
import AdminProjectTaskFetch from "./AdminProjectTaskFetch";
import AdminProjectTaskMaintenance from "./AdminProjectTaskMaintenance";

export function AdminProjectTask({ resource, project, loading, doGet }) {
  const { t } = useTranslation();
  const { task, assignableUsers } = resource || {
    task: null,
    assignableUsers: null
  };
  const handleReload = function() {
    doGet({ projectId: project.id, taskId: task.id });
  };

  if (loading && !task) {
    return <Loading global />;
  }

  const ongoingAssignments = task.assignments.filter(
    assignment =>
      ![TaskAssignment.STATUS.DONE, TaskAssignment.STATUS.ERROR].includes(
        assignment.status
      )
  );
  const completedAssignments = task.assignments.filter(
    assignment => assignment.status === TaskAssignment.STATUS.DONE
  );

  const groupedAssignableUsers = {
    [Project.USER_PERMISSION.ANNOTATOR]: assignableUsers.filter(
      user => user.permission === Project.USER_PERMISSION.ANNOTATOR
    ),
    [Project.USER_PERMISSION.PROJECT_ADMIN]: assignableUsers.filter(user =>
      [
        Project.USER_PERMISSION.PROJECT_ADMIN,
        Project.USER_PERMISSION.SUPER_ADMIN,
        Project.USER_PERMISSION.APP_ADMIN
      ].includes(user.permission)
    )
  };

  return (
    <>
      <Card className="w-100 mb-4">
        {loading && <Loading />}
        <Card.Header>
          <Nav className="justify-content-between">
            <Nav.Item>
              <h3>
                <Link to={`/admin/projects/${project.id}`}>{t("tasks")}</Link>
                {" :: "}
                <span>{task.name}</span>
              </h3>
            </Nav.Item>
            <Nav.Item>
              <LinkContainer
                to={`/admin/projects/${project.id}/tasks/${task.id}/edit`}
              >
                <Button variant="outline-info">{t("edit-button")}</Button>
              </LinkContainer>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <Card.Body>
          <Container>
            <Row>
              <Col>
                <Row>
                  <Col>
                    <Row>
                      <Col className="col-3 text-right">{t("created-by")}</Col>
                      <Col>
                        {task.createdBy.username} ({parseDate(task.createdAt)})
                      </Col>
                    </Row>
                    <Row>
                      <Col className="col-3 text-right">{t("updated-by")}</Col>
                      <Col>
                        {task.createdBy.username} ({parseDate(task.createdAt)})
                      </Col>
                    </Row>
                    <Row>
                      <Col className="col-3 text-right">{t("template")}</Col>
                      <Col>
                        <Link
                          to={`/admin/projects/${project.id}/taskTemplates/${
                            task.template.id
                          }`}
                        >
                          {task.template.name}
                        </Link>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="col-3 text-right">
                        {t("media-source")}
                      </Col>
                      <Col>
                        <Link
                          to={`/admin/projects/${project.id}/mediaSources/${
                            task.mediaSource.id
                          }`}
                        >
                          {task.mediaSource.name}
                        </Link>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="col-3 text-right">{t("path")}</Col>
                      <Col>
                        <code>{task.mediaSourceOptions.path || "/"}</code>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="col-3 text-right">{t("conditions")}</Col>
                      <Col>
                        <small>
                          {task.mediaSourceOptions.excludeAlreadyUsed && (
                            <Row>
                              <Col className="col-3 text-right">
                                {t("exclude-used")}
                              </Col>
                              <Col>{t("yes")}</Col>
                            </Row>
                          )}
                          {task.mediaSourceConditions
                            .filter(condition => condition.value !== null)
                            .map((condition, i) => (
                              <Row key={`${i}_${condition.label}`}>
                                <Col className="col-3 text-right">
                                  {condition.label}
                                </Col>
                                <Col>
                                  <code>{condition.value || "--"}</code>
                                </Col>
                              </Row>
                            ))}
                        </small>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="col-3 text-right">
                        {t("task-assignment-default-items")}
                      </Col>
                      <Col>
                        <code>
                          {task.assignmentDefaultItems ??
                            Task.DEFAULT_ASSIGNMENT_SIZE}
                        </code>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="col-3 text-right">
                        {t("task-assignment-default-order")}
                      </Col>
                      <Col>
                        <code>
                          {t(
                            Task.ASSIGNMENT_ORDER_TEXT[
                              task.assignmentDefaultOrder ??
                                Task.DEFAULT_ASSIGNMENT_ORDER
                            ]
                          )}
                        </code>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="col-3 text-right">{t("progress")}</Col>
                      <Col className="d-flex flex-row align-items-center">
                        <Badge variant="secondary">
                          {task.done}/{task.total}
                        </Badge>
                        <ProgressBar
                          className="flex-fill mr-1 ml-1"
                          variant={
                            task.status === Task.STATUS.DONE
                              ? "success"
                              : "info"
                          }
                          now={(task.done / task.total) * 100}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col className="col-3 text-right">{t("assigned")}</Col>
                      <Col className="d-flex flex-row align-items-center">
                        <Badge variant="secondary">
                          {task.total - task.assignable}/{task.total}
                        </Badge>
                        <ProgressBar
                          className="flex-fill mr-1 ml-1"
                          variant="info"
                          now={
                            ((task.total - task.assignable) / task.total) * 100
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col className="col-3 text-right">Status</Col>
                      <Col>
                        <code>{t(Task.STATUS_TEXT[task.status])}</code>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
              <Col>
                <Row className="bg-light p-3 rounded">{task.description}</Row>
              </Col>
            </Row>
          </Container>
        </Card.Body>
        <Card.Header>{t("assignments")}</Card.Header>
        <ListGroup variant="flush">
          <ListGroup.Item>{t("ongoing")}</ListGroup.Item>
          {ongoingAssignments.map(assignment => (
            <AdminProjectTaskAssignment
              key={assignment.id}
              project={project}
              task={task}
              assignment={assignment}
              assignableUsers={groupedAssignableUsers}
              reload={handleReload}
            />
          ))}
          <ListGroup.Item>{t("complete")}</ListGroup.Item>
          {completedAssignments.map(assignment => (
            <AdminProjectTaskAssignment
              key={assignment.id}
              project={project}
              task={task}
              assignment={assignment}
              assignableUsers={null}
              reload={handleReload}
            />
          ))}
        </ListGroup>
      </Card>
      <AdminProjectTaskExport
        projectId={project.id}
        taskId={task.id}
        exportJobs={task.exportJobs}
        reload={handleReload}
      />
      <br />
      <AdminProjectTaskFetch
        projectId={project.id}
        task={task}
        fetchJobs={task.fetchJobs}
        reload={handleReload}
      />
      <br />
      <AdminProjectTaskMaintenance
        projectId={project.id}
        task={task}
        fetchJobs={task.maintenanceJobs}
        reload={handleReload}
      />
    </>
  );
}

const fetchDependencies = async function(params) {
  const [task, assignableUsers] = await Promise.all([
    fetchTask(params),
    fetchProjectAssignableUsers(params)
  ]);

  return { task, assignableUsers };
};
export default apiContainerFactory(AdminProjectTask, fetchDependencies);
