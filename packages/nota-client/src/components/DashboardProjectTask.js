import React from "react";
import {
  Badge,
  Button,
  Card,
  Form,
  InputGroup,
  ListGroup,
  Nav,
  ToggleButton,
  ToggleButtonGroup
} from "react-bootstrap";
import { persistTaskAssignment } from "../lib/api";
import history from "../lib/history";
import { Task, TaskAssignment } from "../lib/models";
import DashboardProjectTaskAssignment from "./DashboardProjectTaskAssignment";
import Loading from "./Loading";

const MIN_ASSIGNMENT_SIZE = 1;
const MAX_ASSIGNMENT_SIZE = 500;
const ORDER = {
  RANDOM: "RANDOM",
  SEQUENTIAL: "SEQUENTIAL"
};

const DashboardProjectTask = function({ project, task, reload }) {
  const [updating, setUpdating] = React.useState(false);
  const [showComplete, setShowComplete] = React.useState(false);
  const [newAssignmentSize, setNewAssignmentSize] = React.useState("100");
  const [random, setRandom] = React.useState(ORDER.RANDOM);
  const toggleShowComplete = function() {
    setShowComplete(!showComplete);
  };
  const handleAssignmentSizeChange = function(evt) {
    const size = parseInt(evt.target.value);
    const limitedSize = Math.min(
      Math.max(MIN_ASSIGNMENT_SIZE, size),
      MAX_ASSIGNMENT_SIZE
    );
    setNewAssignmentSize(limitedSize.toString());
  };
  const handleRandomChange = function(value) {
    setRandom(value);
  };
  const handleGetNewAssignment = async function() {
    setUpdating(true);
    const newAssignment = await persistTaskAssignment({
      projectId: project.id,
      taskId: task.id,
      options: {
        size: newAssignmentSize,
        random: random === ORDER.RANDOM ? true : false
      }
    });

    if (newAssignment.id) {
      history.push(`/annotation/${project.id}/${task.id}/${newAssignment.id}`);
    } else {
      window.alert("No available assignments");
      await reload();
      setUpdating(false);
    }
  };
  const ongoingAssignments = task.assignments.filter(
    assignment =>
      ![TaskAssignment.STATUS.DONE, TaskAssignment.STATUS.ERROR].includes(
        assignment.status
      )
  );
  const completedAssignments = task.assignments.filter(
    assignment => assignment.status === TaskAssignment.STATUS.DONE
  );
  const canGetNewAssignment = task.assignable > 0 && !ongoingAssignments.length;

  return (
    <>
      {updating && <Loading global />}
      <Card className="m-4" bg="dark" text="light">
        <Card.Header>
          <Nav className="justify-content-between">
            <Nav.Item>
              <h3>
                {task.status === Task.STATUS.HIDDEN && `[HIDDEN] `}{" "}
                {project.name} - {task.name}
              </h3>
            </Nav.Item>
            <Nav.Item>
              <div className="mr-auto d-flex flex-column">
                <div>残り: {task.assignable}</div>
              </div>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <ListGroup variant="flush">
          {canGetNewAssignment && (
            <ListGroup.Item
              style={{ backgroundColor: "rgba(255,255,255,0.7)" }}
              className="shadow-lg text-dark"
            >
              <div className="d-flex justify-content-center flex-column">
                <div className="text-center">
                  <i>アサインされてるアノテーションありません</i>
                </div>
                <br />
                <div className="d-flex justify-content-center flex-row pt-1">
                  <InputGroup size="lg" className="mr-3 w-auto">
                    <Form.Control
                      type="number"
                      value={newAssignmentSize}
                      style={{ width: 100 }}
                      onChange={handleAssignmentSizeChange}
                    />
                    <InputGroup.Append>
                      <InputGroup.Text>件</InputGroup.Text>
                    </InputGroup.Append>
                  </InputGroup>
                  <ToggleButtonGroup
                    className="mr-3"
                    size="lg"
                    type="radio"
                    name="random"
                    value={random}
                    onChange={handleRandomChange}
                  >
                    <ToggleButton variant="outline-dark" value={ORDER.RANDOM}>
                      ランダム
                    </ToggleButton>
                    <ToggleButton
                      variant="outline-dark"
                      value={ORDER.SEQUENTIAL}
                    >
                      連番
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <Button
                    className="flex-grow-1"
                    size="lg"
                    variant="success"
                    onClick={handleGetNewAssignment}
                  >
                    {project.name} - {task.name}の次のアノテーションを開始する
                  </Button>
                </div>
              </div>
            </ListGroup.Item>
          )}
          {ongoingAssignments.map(assignment => (
            <DashboardProjectTaskAssignment
              key={assignment.id}
              project={project}
              task={task}
              assignment={assignment}
              reload={reload}
            />
          ))}
        </ListGroup>
        <Card.Header className="text-secondary">
          <Nav className="justify-content-between">
            <Nav.Item>
              完了{" "}
              <Badge pill variant="secondary">
                {completedAssignments.length}
              </Badge>
            </Nav.Item>
            <Nav.Item>
              <Form.Check
                type="checkbox"
                id={`show-complete-${task.id}`}
                label="完了されてるアノテーションを表示"
                checked={showComplete}
                onChange={toggleShowComplete}
              />
            </Nav.Item>
          </Nav>
        </Card.Header>
        {showComplete && (
          <ListGroup variant="flush">
            {completedAssignments.map(assignment => (
              <DashboardProjectTaskAssignment
                key={assignment.id}
                project={project}
                task={task}
                assignment={assignment}
                reload={reload}
              />
            ))}
          </ListGroup>
        )}
      </Card>
    </>
  );
};

export default DashboardProjectTask;
