import React from "react";
import { Button, Card, Form, Nav } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { fetchTemplate, persistTemplate, updateTemplate } from "../../lib/api";
import { apiContainerFactory } from "../../lib/apiContainerFactory";
import history from "../../lib/history";
import useInputForm, { string } from "../../lib/useInputForm";
import Loading from "../Loading";

export function AdminProjectTemplate({
  isNew = false,
  resource: taskTemplate,
  project,
  loading,
  doGet,
  params
}) {
  const { t } = useTranslation();
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
    template: string()
      .required()
      .addValidation(val => {
        try {
          JSON.parse(values.template);
          return [null];
        } catch (error) {
          return ["JSON is invalid"];
        }
      })
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
                {t("templates")}
              </Link>
              {" :: "}
              <span>{isNew ? t("new-template") : taskTemplate.name}</span>
            </h3>
          </Nav.Item>
          <Nav.Item />
        </Nav>
      </Card.Header>
      <Card.Body>
        <Form noValidate>
          <Form.Group>
            <Form.Label>{t("template-name")}</Form.Label>
            <Form.Control
              disabled={updating}
              type="text"
              placeholder={t("template-name")}
              name="name"
              value={values.name}
              onChange={handleChange}
              isInvalid={touched.name && errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {t("required-error", { field: t("template-name") })}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>{t("template-description")}</Form.Label>
            <Form.Control
              disabled={updating}
              as="textarea"
              placeholder={t("template-description")}
              name="description"
              value={values.description}
              onChange={handleChange}
              isInvalid={touched.description && errors.description}
            />
            <Form.Control.Feedback type="invalid">
              {t("required-error", { field: t("template-description") })}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>{t("template-definition")}</Form.Label>
            <Form.Control
              disabled={updating}
              as="textarea"
              rows={15}
              name="template"
              value={values.template}
              onChange={handleChange}
              isInvalid={touched.template && errors.template}
            />
            <Form.Control.Feedback type="invalid">
              {errors.template?.[0] === "required"
                ? t("required-error", { field: t("template-definition") })
                : t(errors.template?.[0])}
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
              {t("save-button")}
            </Button>{" "}
            <Button
              variant="outline-secondary"
              onClick={isNew ? history.goBack : handleReset}
              disabled={!isNew && !hasChanged}
            >
              {t("cancel-button")}
            </Button>
          </Nav.Item>
        </Nav>
      </Card.Footer>
    </Card>
  );
}

export default apiContainerFactory(AdminProjectTemplate, fetchTemplate);
