import React from "react";
import { Button, Card, Form, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { fetchTemplate, updateTemplate, persistTemplate } from "../../lib/api";
import { apiContainerFactory } from "../../lib/apiContainerFactory";
import useInputForm, { string } from "../../lib/useInputForm";
import Loading from "../Loading";
import history from "../../lib/history";

export function AdminProjectTemplate({
  isNew = false,
  resource: taskTemplate,
  project,
  loading,
  doGet,
  params
}) {
  const [updating, setUpdating] = React.useState(false);
  const saveTemplate = async function(values) {
    setUpdating(true);
    await (isNew ? persistTemplate : updateTemplate)({
      projectId: project.id,
      taskTemplate: {
        ...values,
        template: JSON.parse(values.template),
        id: taskTemplate ? taskTemplate.id : undefined
      }
    });
    setUpdating(false);
    isNew
      ? history.push(`/admin/projects/${project.id}/taskTemplates`)
      : doGet(params);
  };
  const formSchema = {
    name: string().required(),
    description: string().required(),
    template: string().required()
  };
  const [
    { values, touched, errors },
    handleChange,
    handleSubmit,
    handleReset
  ] = useInputForm(saveTemplate, formSchema, {
    name: taskTemplate ? taskTemplate.name : "",
    description: taskTemplate ? taskTemplate.description : "",
    template: taskTemplate ? JSON.stringify(taskTemplate.template, null, 2) : ""
  });
  const hasChanged = Object.entries(touched).length;

  if (!isNew && loading) {
    return <Loading global />;
  }

  return (
    <Card className="w-100">
      <Card.Header>
        <Nav className="justify-content-between">
          <Nav.Item>
            <h3>
              <Link to={`/admin/projects/${project.id}/taskTemplates`}>
                Templates
              </Link>
              {" :: "}
              <span>{isNew ? "New Template" : taskTemplate.name}</span>
            </h3>
          </Nav.Item>
          <Nav.Item />
        </Nav>
      </Card.Header>
      <Card.Body>
        <Form noValidate>
          <Form.Group>
            <Form.Label>Template Name</Form.Label>
            <Form.Control
              disabled={updating}
              type="text"
              placeholder="Template Name"
              name="name"
              value={values.name}
              onChange={handleChange}
              isInvalid={touched.name && errors.name}
            />
            <Form.Control.Feedback type="invalid">
              Template Name is required
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              disabled={updating}
              as="textarea"
              placeholder="Template Description"
              name="description"
              value={values.description}
              onChange={handleChange}
              isInvalid={touched.description && errors.description}
            />
            <Form.Control.Feedback type="invalid">
              Template description is required
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>Template JSON</Form.Label>
            <Form.Control
              disabled={updating}
              as="textarea"
              rows={15}
              placeholder="Template JSON"
              name="template"
              value={values.template}
              onChange={handleChange}
              isInvalid={touched.template && errors.template}
            />
            <Form.Control.Feedback type="invalid">
              Template JSON is required
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Card.Body>
      <Card.Footer>
        <Nav className="justify-content-between">
          <Nav.Item>
            <Button
              variant="success"
              onClick={handleSubmit}
              disabled={!hasChanged}
            >
              Save
            </Button>{" "}
            <Button
              variant="outline-secondary"
              onClick={isNew ? history.goBack : handleReset}
              disabled={!isNew && !hasChanged}
            >
              Cancel
            </Button>
          </Nav.Item>
        </Nav>
      </Card.Footer>
    </Card>
  );
}

export default apiContainerFactory(AdminProjectTemplate, fetchTemplate);
