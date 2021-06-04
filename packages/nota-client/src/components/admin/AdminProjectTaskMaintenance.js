import React, { useRef } from "react";
import { Button, Card, Col, ListGroup, Nav, Row, Modal } from "react-bootstrap";
import { parseDate } from "../../lib/utils";
import { performTaskMaintenance } from "../../lib/api";
import { JobTask } from "../../lib/models";
import useInputForm, { string } from "../../lib/useInputForm";
import { Form } from "react-bootstrap";

function AdminProjectTaskMaintenance({
  projectId,
  task,
  fetchJobs = [],
  reload
}) {
  const [showNewMaintenanceModal, setShowNewMaintenanceModal] = React.useState(
    false
  );
  const annotationNamesSelect = useRef();

  const handlePerformMaintenance = async function(values) {
    const maintenance = {
      type: "STATUS_RESET",
      options: {
        annotations: ["UNDO_ALL", "UNDO_BY_NAME"].includes(values.annotations),
        annotationConditions: {},
        taskItems: ["UNDO_ONGOING", "UNDO_ALL"].includes(values.taskItems),
        taskItemConditions: {
          onlyWithOngoing: values.taskItems === "UNDO_ONGOING"
        },
        taskAssignments: ["UNDO_ONGOING", "UNDO_ALL"].includes(
          values.taskAssignments
        ),
        taskAssignmentConditions: {
          onlyWithOngoing: values.taskAssignments === "UNDO_ONGOING"
        }
      }
    };

    if (values.annotations === "UNDO_BY_NAME") {
      if (!values.annotationNames) {
        return;
      }

      maintenance.options.annotationConditions.name = values.annotationNames.split(
        ","
      );
    }

    performTaskMaintenance({ projectId, taskId: task.id, maintenance });
    setShowNewMaintenanceModal(false);
    reload();
  };
  const handleClickNew = async function() {
    setShowNewMaintenanceModal(true);
  };
  const handleCloseModal = function() {
    setShowNewMaintenanceModal(false);
  };

  const formSchema = {
    annotations: string().required(),
    annotationNames: string(),
    taskItems: string().required(),
    taskAssignments: string().required()
  };
  const [
    { values, touched, errors },
    handleChange,
    handleSubmit
  ] = useInputForm(handlePerformMaintenance, formSchema, {
    annotations: "NO_ACTION",
    taskItems: "UNDO_ONGOING",
    taskAssignments: "NO_ACTION",
    annotationNames: ""
  });
  const templateAnnotationNames = (
    task.template.template.annotations || []
  ).map(annotation => annotation.name);

  return (
    <>
      <Card className="w-100">
        <Card.Header>
          <Nav className="justify-content-between">
            <Nav.Item>
              <span>Last Task Maintenance</span>
            </Nav.Item>
            <Nav.Item>
              <Button variant="outline-success" onClick={handleClickNew}>
                New Task Maintenance...
              </Button>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <ListGroup variant="flush">
          {fetchJobs.map(job => (
            <ListGroup.Item key={job.id}>
              <Row className="align-items-center">
                <Col>{job.id}</Col>
                <Col>{JobTask.TYPE_TEXT[job.type]}</Col>
                <Col>{JobTask.STATUS_TEXT[job.status]}</Col>
                <Col>{JSON.stringify(job.config.result)}</Col>
                <Col>
                  <div>
                    <small>Created: {parseDate(job.createdAt)}</small>
                  </div>
                  <div>
                    <small>
                      Started: {job.startedAt ? parseDate(job.startedAt) : "--"}
                    </small>
                  </div>
                  <div>
                    <small>
                      Finished:{" "}
                      {job.finishedAt ? parseDate(job.finishedAt) : "--"}
                    </small>
                  </div>
                </Col>
              </Row>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card>
      <Modal show={showNewMaintenanceModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Task Maintenance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate>
            <Form.Group>
              <Form.Label>Annotation</Form.Label>
              <Form.Control
                as="select"
                value={values.annotations}
                name="annotations"
                onChange={handleChange}
                isInvalid={touched.annotations && errors.annotations}
              >
                <option value="NO_ACTION">完了を外さない</option>
                <option value="UNDO_ALL">
                  全てのアノテーションの完了を外す
                </option>
                <option value="UNDO_BY_NAME">
                  特定の種類のアノテーションの完了を外す
                </option>
              </Form.Control>
              <Form.Control.Feedback type="invalid">
                Annotationは必須です
              </Form.Control.Feedback>
            </Form.Group>
            {values.annotations === "UNDO_BY_NAME" ? (
              <Form.Group>
                <Form.Label>Annotation Name List</Form.Label>
                <Form.Control
                  as="select"
                  ref={annotationNamesSelect}
                  multiple
                  value={values.annotationNames.split(",")}
                  name="annotationNames"
                  onChange={evt => {
                    handleChange({
                      target: {
                        name: evt.target.name,
                        value: [...evt.target.selectedOptions]
                          .map(option => option.value)
                          .join(",")
                      }
                    });
                  }}
                  isInvalid={touched.annotationNames && errors.annotationNames}
                >
                  {templateAnnotationNames.map(name => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  Annotationは必須です
                </Form.Control.Feedback>
              </Form.Group>
            ) : null}
            <Form.Group>
              <Form.Label>Task Item</Form.Label>
              <Form.Control
                as="select"
                value={values.taskItems}
                name="taskItems"
                onChange={handleChange}
                isInvalid={touched.taskItems && errors.taskItems}
              >
                <option value="UNDO_ONGOING">
                  上で外したアノテーションがあるのみ完了を外す
                </option>
                <option value="UNDO_ALL">タスクの全件の完了を外す</option>
              </Form.Control>
              <Form.Control.Feedback type="invalid">
                Task Itemは必須です
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label>Task Assignment</Form.Label>
              <Form.Control
                as="select"
                value={values.taskAssignments}
                name="taskAssignments"
                onChange={handleChange}
                isInvalid={touched.taskAssignments && errors.taskAssignments}
              >
                <option value="NO_ACTION">完了を外さない</option>
                <option value="UNDO_ONGOING">
                  上で外した画像・動画があるのみ完了を外す
                </option>
                <option value="UNDO_ALL">
                  アサインタスクの全件の完了を外す
                </option>
              </Form.Control>
              <Form.Control.Feedback type="invalid">
                Task Assignmentは必須です
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="success" onClick={handleSubmit}>
            Perform Task Maintenance
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AdminProjectTaskMaintenance;
