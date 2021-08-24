import React from "react";
import { Button, Card, Nav, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";
import { fetchTasks } from "../../lib/api";
import { apiContainerFactory } from "../../lib/apiContainerFactory";
import { Task } from "../../lib/models";
import useIntervalReload from "../../lib/useIntervalReload";
import Loading from "../Loading";

export function AdminProjectTasks({
  resource: tasks,
  loading,
  project,
  doGet,
  params
}) {
  const { t } = useTranslation();
  const shouldReload =
    tasks &&
    tasks.some(task =>
      [Task.STATUS.CREATING, Task.STATUS.UPDATING].includes(task.status)
    );
  useIntervalReload(() => {
    doGet(params);
  }, shouldReload);

  if (!tasks && loading) {
    return <Loading global />;
  }

  return (
    <Card className="w-100">
      <Card.Header>
        <Nav className="justify-content-between">
          <h3>{t("tasks")}</h3>
          <Nav.Item>
            <LinkContainer to={`/admin/projects/${project.id}/tasks/new`}>
              <Button variant="outline-success">{t("new-task")}</Button>
            </LinkContainer>
          </Nav.Item>
        </Nav>
      </Card.Header>
      <Card.Body>
        <Table striped>
          <thead>
            <tr>
              <th>{t("id")}</th>
              <th>{t("task")}</th>
              <th>{t("template")}</th>
              <th>{t("status")}</th>
              <th>{t("progress")}</th>
              <th>{t("not-assigned")}</th>
              <th>{t("done")}</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                <td>
                  <Link to={`/admin/projects/${project.id}/tasks/${task.id}`}>
                    {task.id}
                  </Link>
                </td>
                <td>
                  <Link to={`/admin/projects/${project.id}/tasks/${task.id}`}>
                    {task.name}
                  </Link>
                </td>
                <td>
                  <Link
                    to={`/admin/projects/${project.id}/taskTemplates/${
                      task.template.id
                    }`}
                  >
                    {task.template.name}
                  </Link>
                </td>
                <td>{t(Task.STATUS_TEXT[task.status])}</td>
                <td>
                  {task.done}/{task.total}
                </td>
                <td>{task.assignable}</td>
                <td>{task.done === task.total ? "✅" : ""}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

export default apiContainerFactory(AdminProjectTasks, fetchTasks);
