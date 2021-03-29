import React from "react";
import { Button, Card, Nav, Table } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";
import { downloadTaskResults, fetchTasks } from "../../lib/api";
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
  const shouldReload =
    tasks &&
    tasks.some(task =>
      [Task.STATUS.CREATING, Task.STATUS.UPDATING].includes(task.status)
    );
  useIntervalReload(() => {
    doGet(params);
  }, shouldReload);
  const handleDownload = async function(taskId) {
    await downloadTaskResults({
      projectId: project.id,
      taskId,
      options: {}
    });
  };

  if (!tasks && loading) {
    return <Loading global />;
  }

  return (
    <Card className="w-100">
      <Card.Header>
        <Nav className="justify-content-between">
          <h3>Tasks</h3>
          <Nav.Item>
            <LinkContainer to={`/admin/projects/${project.id}/tasks/new`}>
              <Button variant="outline-success">新規タスク</Button>
            </LinkContainer>
          </Nav.Item>
        </Nav>
      </Card.Header>
      <Card.Body>
        <Table striped>
          <thead>
            <tr>
              <th>Id</th>
              <th>タスク</th>
              <th>テンプレート</th>
              <th>Status</th>
              <th>Done</th>
              <th>Not assigned</th>
              <th>完了</th>
              <th>アクション</th>
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
                <td>{Task.STATUS_TEXT[task.status]}</td>
                <td>
                  {task.done}/{task.total}
                </td>
                <td>{task.assignable}</td>
                <td>{task.done === task.total ? "✅" : ""}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-info"
                    hidden
                    onClick={() => handleDownload(task.id)}
                  >
                    ダウンロード
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

export default apiContainerFactory(AdminProjectTasks, fetchTasks);
