import React from "react";
import { Button, Card, Form, Nav, Container, Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { persistProject } from "../../lib/api";
import history from "../../lib/history";
import useInputForm, { string } from "../../lib/useInputForm";

const AdminProjectNew = function({ reloadProjectsList }) {
  const { t } = useTranslation();
  const canSaveProject = ({ name }) => name;

  const saveProject = async function(values) {
    if (!canSaveProject(values)) return;

    const project = await persistProject({
      project: {
        name: values.name
      }
    });
    await reloadProjectsList();
    history.push(`/admin/projects/${project.id}`);
  };
  const formSchema = {
    name: string().required()
  };
  const [
    { values, touched, errors },
    handleChange,
    handleSubmit
  ] = useInputForm(saveProject, formSchema, {
    name: ""
  });

  return (
    <Container fluid className="h-100">
      <Row className="pt-3 p-2">
        <Col>
          <Card className="w-100">
            <Card.Header>
              <Nav className="justify-content-between">
                <Nav.Item>
                  <h3>{t("new-project")}</h3>
                </Nav.Item>
                <Nav.Item />
              </Nav>
            </Card.Header>
            <Card.Body>
              <Form noValidate>
                <Form.Group>
                  <Form.Label>{t("project-name")}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t("project-name")}
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    isInvalid={touched.name && errors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {t("required-error", { field: t("project-name") })}
                  </Form.Control.Feedback>
                </Form.Group>
              </Form>
            </Card.Body>
            <Card.Footer>
              <Nav className="justify-content-between">
                <Nav.Item>
                  <Button variant="success" onClick={handleSubmit}>
                    {t("create-project")}
                  </Button>{" "}
                  <Button variant="outline-secondary" onClick={history.goBack}>
                    {t("cancel-button")}
                  </Button>
                </Nav.Item>
              </Nav>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminProjectNew;
