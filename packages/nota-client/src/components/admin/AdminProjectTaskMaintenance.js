import React, { useRef } from "react";
import { Button, Card, Col, ListGroup, Nav, Row, Modal } from "react-bootstrap";
import { parseDate } from "../../lib/utils";
import { performTaskMaintenance } from "../../lib/api";
import { JobTask } from "../../lib/models";
import useInputForm, { string } from "../../lib/useInputForm";
import { Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";

function AdminProjectTaskMaintenance({
  projectId,
  task,
  fetchJobs = [],
  reload
}) {
  const { t } = useTranslation();
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
              <span>{t("last-task-maintenances")}</span>
            </Nav.Item>
            <Nav.Item>
              <Button variant="outline-success" onClick={handleClickNew}>
                {t("new-task-maintenance")}
              </Button>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <ListGroup variant="flush">
          {fetchJobs.map(job => (
            <ListGroup.Item key={job.id}>
              <Row className="align-items-center">
                <Col>{job.id}</Col>
                <Col>{t(JobTask.TYPE_TEXT[job.type])}</Col>
                <Col>{t(JobTask.STATUS_TEXT[job.status])}</Col>
                <Col>{JSON.stringify(job.config.result)}</Col>
                <Col>
                  <div>
                    <small>
                      {t("created")}: {parseDate(job.createdAt)}
                    </small>
                  </div>
                  <div>
                    <small>
                      {t("started")}:{" "}
                      {job.startedAt ? parseDate(job.startedAt) : "--"}
                    </small>
                  </div>
                  <div>
                    <small>
                      {t("finished")}:{" "}
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
          <Modal.Title>{t("task-maintenance")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate>
            <Form.Group>
              <Form.Label>{t("task-maintenance-1")}</Form.Label>
              <Form.Control
                as="select"
                value={values.annotations}
                name="annotations"
                onChange={handleChange}
                isInvalid={touched.annotations && errors.annotations}
              >
                <option value="NO_ACTION">{t("task-maintenance-2")}</option>
                <option value="UNDO_ALL">{t("task-maintenance-3")}</option>
                <option value="UNDO_BY_NAME">{t("task-maintenance-4")}</option>
              </Form.Control>
            </Form.Group>
            {values.annotations === "UNDO_BY_NAME" ? (
              <Form.Group>
                <Form.Label>{t("task-maintenance-5")}</Form.Label>
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
              </Form.Group>
            ) : null}
            <Form.Group>
              <Form.Label>{t("task-maintenance-6")}</Form.Label>
              <Form.Control
                as="select"
                value={values.taskItems}
                name="taskItems"
                onChange={handleChange}
                isInvalid={touched.taskItems && errors.taskItems}
              >
                <option value="UNDO_ONGOING">{t("task-maintenance-7")}</option>
                <option value="UNDO_ALL">{t("task-maintenance-8")}</option>
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>{t("task-maintenance-9")}</Form.Label>
              <Form.Control
                as="select"
                value={values.taskAssignments}
                name="taskAssignments"
                onChange={handleChange}
                isInvalid={touched.taskAssignments && errors.taskAssignments}
              >
                <option value="NO_ACTION">{t("task-maintenance-10")}</option>
                <option value="UNDO_ONGOING">{t("task-maintenance-11")}</option>
                <option value="UNDO_ALL">{t("task-maintenance-12")}</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            {t("close-button")}
          </Button>
          <Button variant="success" onClick={handleSubmit}>
            {t("perform-task-maintenance")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AdminProjectTaskMaintenance;
