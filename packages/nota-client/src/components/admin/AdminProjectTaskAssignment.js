import React from "react";
import {
  Badge,
  Button,
  Col,
  FormControl,
  ListGroup,
  ProgressBar,
  Row
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { returnUnfinishedTaskItems, updateTaskAssignment } from "../../lib/api";
import { Project, TaskAssignment } from "../../lib/models";
import { parseDate } from "../../lib/utils";

export function AdminProjectTaskAssignment({
  project,
  task,
  assignment,
  assignableUsers,
  reload
}) {
  const [newAssignedUser, setNewAssignedUser] = React.useState("");
  const done = assignment.status === TaskAssignment.STATUS.DONE;
  const canBeSetAsComplete = !done && assignment.done === assignment.total;
  const handleChangeNewAssignedUser = function(evt) {
    setNewAssignedUser(evt.target.value);
  };
  const handleSaveNewAssignedUser = async function() {
    if (!newAssignedUser) return;

    await updateTaskAssignment({
      projectId: project.id,
      taskId: task.id,
      taskAssignment: {
        id: assignment.id,
        annotatorId: parseInt(newAssignedUser)
      }
    });
    await reload();
  };
  const handleSetAsComplete = async function() {
    if (!canBeSetAsComplete) return;

    await updateTaskAssignment({
      projectId: project.id,
      taskId: task.id,
      taskAssignment: {
        id: assignment.id,
        status: TaskAssignment.STATUS.DONE
      }
    });
    await reload();
  };
  const handleSetAsNotComplete = async function() {
    if (!done) return;

    await updateTaskAssignment({
      projectId: project.id,
      taskId: task.id,
      taskAssignment: {
        id: assignment.id,
        status: TaskAssignment.STATUS.ANNOTATION_READY
      }
    });
    await reload();
  };
  const handleReturnUnfinishedMediaItems = async function() {
    if (done) return;

    await returnUnfinishedTaskItems({
      projectId: project.id,
      taskId: task.id,
      taskAssignmentId: assignment.id
    });
    await reload();
  };

  return (
    <ListGroup.Item className="pt-1 pb-1">
      <Row className="align-items-center">
        <Col className="align-items-center d-flex flex-row">
          <div style={{ width: 50 }}>
            <Link to={`/annotation/${project.id}/${task.id}/${assignment.id}`}>
              <small>ID: {assignment.id}</small>
            </Link>
          </div>
          <Badge variant="secondary">{`${assignment.done}/${
            assignment.total
          }`}</Badge>
          <ProgressBar
            className="flex-fill mr-1 ml-1"
            variant={
              assignment.status === TaskAssignment.STATUS.DONE
                ? "success"
                : "info"
            }
            now={(assignment.done / assignment.total) * 100}
          />
        </Col>
        <Col>
          <div>
            <small>{parseDate(assignment.createdAt)}</small>
          </div>
          <div>
            <small>{done ? parseDate(assignment.updatedAt) : "--"}</small>
          </div>
        </Col>
        <Col>
          {done && (
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={handleSetAsNotComplete}
            >
              未完了に戻す
            </Button>
          )}
          {canBeSetAsComplete && (
            <Button size="sm" variant="success" onClick={handleSetAsComplete}>
              完了にする
            </Button>
          )}
          {!done && !canBeSetAsComplete && (
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={handleReturnUnfinishedMediaItems}
            >
              完了してない件数を戻す
            </Button>
          )}
        </Col>
        <Col>
          {!assignableUsers && assignment.annotator.username}
          {assignableUsers && (
            <div className="d-flex flex-row">
              <FormControl
                as="select"
                size="sm"
                value={newAssignedUser}
                name="newAssignedUser"
                onChange={handleChangeNewAssignedUser}
              >
                <option value="">{assignment.annotator.username}</option>
                <optgroup label="Annotators">
                  {assignableUsers[Project.USER_PERMISSION.ANNOTATOR].map(
                    user => (
                      <option
                        key={user.id}
                        value={user.id}
                        disabled={user.id === assignment.annotator.id}
                      >
                        {user.username}
                      </option>
                    )
                  )}
                </optgroup>
                <optgroup label="Admin">
                  {assignableUsers[Project.USER_PERMISSION.PROJECT_ADMIN].map(
                    user => (
                      <option
                        key={user.id}
                        value={user.id}
                        disabled={user.id === assignment.annotator.id}
                      >
                        {user.username}
                      </option>
                    )
                  )}
                </optgroup>
              </FormControl>
              <Button
                className="ml-1"
                size="sm"
                disabled={!newAssignedUser}
                onClick={handleSaveNewAssignedUser}
                variant="outline-success"
              >
                Save
              </Button>
            </div>
          )}
        </Col>
      </Row>
    </ListGroup.Item>
  );
}

export default AdminProjectTaskAssignment;
