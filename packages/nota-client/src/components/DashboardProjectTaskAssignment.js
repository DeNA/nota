import React from "react";
import {
  Button,
  ListGroup,
  Row,
  Col,
  ProgressBar,
  Badge
} from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { TaskAssignment } from "../lib/models";
import { updateTaskAssignment, returnUnfinishedTaskItems } from "../lib/api";
import { useTranslation } from "react-i18next";

const DashboardProjectTaskAssignment = function({
  project,
  task,
  assignment,
  reload
}) {
  const { t } = useTranslation();
  const done = assignment.status === TaskAssignment.STATUS.DONE;
  const canBeSetAsComplete = !done && assignment.done === assignment.total;
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
    <ListGroup.Item
      style={{
        backgroundColor: done
          ? "rgba(255,255,255,0.6)"
          : "rgba(255,255,255,0.8)"
      }}
      className={`shadow text-dark ${done && "p-1 pl-4 pr-3"}`}
    >
      <Row className="align-items-center">
        <Col className="align-items-center d-flex flex-row">
          <div style={{ width: 50 }}>
            <small>
              {t("id")} {assignment.id}
            </small>
          </div>
          <ProgressBar
            style={{ height: 15 }}
            className="flex-fill mr-1 ml-1"
            variant={
              assignment.status === TaskAssignment.STATUS.DONE
                ? "success"
                : "info"
            }
            now={(assignment.done / assignment.total) * 100}
          />
          <Badge variant="secondary">{`${assignment.done}/${
            assignment.total
          }`}</Badge>
        </Col>
        <Col>{done && t("complete")}</Col>
        <Col>
          {done && (
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={handleSetAsNotComplete}
            >
              {t("unmark-complete")}
            </Button>
          )}
          {canBeSetAsComplete && (
            <Button size="sm" variant="success" onClick={handleSetAsComplete}>
              {t("mark-complete")}
            </Button>
          )}
          {!done && !canBeSetAsComplete && (
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={handleReturnUnfinishedMediaItems}
            >
              {t("return-ongoing-items")}
            </Button>
          )}
        </Col>
        <Col>
          <LinkContainer
            to={`/annotation/${project.id}/${task.id}/${assignment.id}`}
          >
            <Button variant="info">{t("go-to-annotation")}</Button>
          </LinkContainer>
        </Col>
      </Row>
    </ListGroup.Item>
  );
};

export default DashboardProjectTaskAssignment;
