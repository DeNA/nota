import React from "react";
import { Button, Card, Form, Modal, Nav } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { deleteTask, fetchTask, updateTask } from "../../lib/api";
import { apiContainerFactory } from "../../lib/apiContainerFactory";
import history from "../../lib/history";
import { Task } from "../../lib/models";
import useInputForm, { integer, string, url } from "../../lib/useInputForm";
import Loading from "../Loading";

function AdminProjectTaskEdit({ resource: task, project, loading }) {
  const { t } = useTranslation();
  const canSaveTask = ({
    name,
    description,
    assignmentDefaultItems,
    assignmentDefaultOrder
  }) => name && description && assignmentDefaultItems && assignmentDefaultOrder;
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const saveTask = async function(values) {
    if (!canSaveTask(values)) return;

    await updateTask({
      projectId: project.id,
      task: {
        id: task.id,
        name: values.name,
        description: values.description,
        status: values.status,
        assignmentDefaultItems: Math.max(
          parseInt(values.assignmentDefaultItems),
          Task.MIN_ASSIGNMENT_SIZE
        ),
        assignmentDefaultOrder: values.assignmentDefaultOrder,
        manualUrl: values.manualUrl
      }
    });

    history.push(`/admin/projects/${project.id}/tasks/${task.id}`);
  };

  const handleDelete = async function() {
    setShowDeleteModal(false);
    await deleteTask({ projectId: project.id, taskId: task.id });
    history.push(`/admin/projects/${project.id}`);
  };
  const handleClickDelete = async function() {
    setShowDeleteModal(true);
  };
  const handleCloseModal = function() {
    setShowDeleteModal(false);
  };

  const formSchema = {
    name: string().required(),
    description: string().required(),
    manualUrl: url(),
    status: integer().required(),
    assignmentDefaultItems: integer().required(),
    assignmentDefaultOrder: string().required()
  };

  const [
    { values, touched, errors },
    handleChange,
    handleSubmit
  ] = useInputForm(saveTask, formSchema, {
    name: task ? task.name : "",
    description: task ? task.description : "",
    manualUrl: task ? task.manualUrl : "",
    status: task ? task.status : "",
    assignmentDefaultItems:
      task && task.assignmentDefaultItems
        ? task.assignmentDefaultItems
        : Task.DEFAULT_ASSIGNMENT_SIZE,
    assignmentDefaultOrder:
      task && task.assignmentDefaultOrder
        ? task.assignmentDefaultOrder
        : Task.DEFAULT_ASSIGNMENT_ORDER
  });

  if (loading) {
    return <Loading />;
  }

  const canChangeStatus =
    task &&
    [Task.STATUS.READY, Task.STATUS.HIDDEN, Task.STATUS.DONE].includes(
      parseInt(task.status)
    );

  return (
    <>
      <Card className="w-100">
        <Card.Header>
          <Nav className="justify-content-between">
            <Nav.Item>
              <h3>
                <Link to={`/admin/projects/${project.id}`}>{t("tasks")}</Link>
                {" :: "}
                <Link to={`/admin/projects/${project.id}/tasks/${task.id}`}>
                  {task.name}
                </Link>
                {" :: "}
                <span>{t("edit")}</span>
              </h3>
            </Nav.Item>
            <Nav.Item />
          </Nav>
        </Card.Header>
        <Card.Body>
          <Form noValidate>
            <Form.Group>
              <Form.Label>{t("task-name")}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t("task-name")}
                name="name"
                value={values.name}
                onChange={handleChange}
                isInvalid={touched.name && errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {t("required-error", { field: t("task-name") })}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label>{t("task-description")}</Form.Label>
              <Form.Control
                as="textarea"
                placeholder={t("task-description")}
                name="description"
                value={values.description}
                onChange={handleChange}
                isInvalid={touched.description && errors.description}
              />
              <Form.Control.Feedback type="invalid">
                {t("required-error", { field: t("task-description") })}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label>{t("task-manualUrl")}</Form.Label>
              <Form.Control
                type="url"
                placeholder={t("task-manualUrl")}
                name="manualUrl"
                value={values.manualUrl}
                onChange={handleChange}
                isInvalid={touched.manualUrl && errors.manualUrl}
              />
              <Form.Control.Feedback type="invalid">
                {t("required-error", { field: t("task-manualUrl") })}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label>{t("task-assignment-default-items")}</Form.Label>
              <Form.Control
                type="number"
                name="assignmentDefaultItems"
                value={values.assignmentDefaultItems}
                min={Task.MIN_ASSIGNMENT_SIZE}
                onChange={handleChange}
                isInvalid={
                  touched.assignmentDefaultItems &&
                  errors.assignmentDefaultItems
                }
              />
              <Form.Control.Feedback type="invalid">
                {t("required-error", {
                  field: t("task-assignment-default-items")
                })}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label>{t("task-assignment-default-order")}</Form.Label>
              <Form.Control
                as="select"
                value={values.assignmentDefaultOrder}
                name="assignmentDefaultOrder"
                onChange={handleChange}
                isInvalid={
                  touched.assignmentDefaultOrder &&
                  errors.assignmentDefaultOrder
                }
              >
                <option
                  key={Task.ASSIGNMENT_ORDER.RANDOM}
                  value={Task.ASSIGNMENT_ORDER.RANDOM}
                >
                  {t("random")}
                </option>
                <option
                  key={Task.ASSIGNMENT_ORDER.SEQUENTIAL}
                  value={Task.ASSIGNMENT_ORDER.SEQUENTIAL}
                >
                  {t("in-order")}
                </option>
              </Form.Control>
              <Form.Control.Feedback type="invalid">
                {t("required-error", {
                  field: t("task-assignment-default-order")
                })}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label>{t("status")}</Form.Label>
              <Form.Check
                type="radio"
                name="status"
                label={t(Task.STATUS_TEXT[Task.STATUS.CREATING])}
                disabled
                checked={parseInt(values.status) === Task.STATUS.CREATING}
              />
              <Form.Check
                type="radio"
                name="status"
                label={t(Task.STATUS_TEXT[Task.STATUS.UPDATING])}
                disabled
                checked={parseInt(values.status) === Task.STATUS.UPDATING}
              />
              <Form.Check
                type="radio"
                name="status"
                label={t(Task.STATUS_TEXT[Task.STATUS.CREATING_ERROR])}
                disabled
                checked={parseInt(values.status) === Task.STATUS.CREATING_ERROR}
              />
              <Form.Check
                type="radio"
                name="status"
                label={t(Task.STATUS_TEXT[Task.STATUS.UPDATING_ERROR])}
                disabled
                checked={parseInt(values.status) === Task.STATUS.UPDATING_ERROR}
              />
              <Form.Check
                type="radio"
                name="status"
                label={t(Task.STATUS_TEXT[Task.STATUS.READY])}
                disabled={!canChangeStatus}
                checked={parseInt(values.status) === Task.STATUS.READY}
                value={Task.STATUS.READY}
                onChange={handleChange}
              />
              <Form.Check
                type="radio"
                name="status"
                label={`${t(Task.STATUS_TEXT[Task.STATUS.HIDDEN])} (${t(
                  "hidden-1"
                )})`}
                disabled={!canChangeStatus}
                checked={parseInt(values.status) === Task.STATUS.HIDDEN}
                value={Task.STATUS.HIDDEN}
                onChange={handleChange}
              />
              <Form.Check
                type="radio"
                name="status"
                label={`${t(Task.STATUS_TEXT[Task.STATUS.DONE])} (${t(
                  "done-1"
                )})`}
                disabled={!canChangeStatus}
                checked={parseInt(values.status) === Task.STATUS.DONE}
                value={Task.STATUS.DONE}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">
                {t("required-error", { field: t("status") })}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Card.Body>
        <Card.Footer>
          <Nav className="justify-content-between">
            <Nav.Item>
              <Button variant="success" onClick={handleSubmit}>
                {t("save-button")}
              </Button>{" "}
              <Button
                variant="outline-secondary"
                onClick={() => history.goBack()}
              >
                {t("cancel-button")}
              </Button>
            </Nav.Item>
            <Nav.Item>
              <Button variant="outline-danger" onClick={handleClickDelete}>
                {t("delete-button")}
              </Button>
            </Nav.Item>
          </Nav>
        </Card.Footer>
      </Card>
      <Modal show={showDeleteModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{t("delete-task")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t("delete-task-1")}
          <br />
          <code>{task.name}</code>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            {t("close-button")}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            {t("delete-button")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default apiContainerFactory(AdminProjectTaskEdit, fetchTask);
