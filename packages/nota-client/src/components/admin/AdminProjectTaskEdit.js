import React from "react";
import { Button, Card, Form, Nav, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { fetchTask, updateTask, deleteTask } from "../../lib/api";
import { apiContainerFactory } from "../../lib/apiContainerFactory";
import history from "../../lib/history";
import { Task } from "../../lib/models";
import useInputForm, { integer, string } from "../../lib/useInputForm";
import Loading from "../Loading";

function AdminProjectTaskEdit({ resource: task, project, loading }) {
  const { t } = useTranslation();
  const canSaveTask = ({ name, description }) => name && description;
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const saveTask = async function(values) {
    if (!canSaveTask(values)) return;

    await updateTask({
      projectId: project.id,
      task: {
        id: task.id,
        name: values.name,
        description: values.description,
        status: values.status
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
    status: integer().required()
  };

  const [
    { values, touched, errors },
    handleChange,
    handleSubmit
  ] = useInputForm(saveTask, formSchema, {
    name: task ? task.name : "",
    description: task ? task.description : "",
    status: task ? task.status : ""
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
