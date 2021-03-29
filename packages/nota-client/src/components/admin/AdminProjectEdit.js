import React from "react";
import { Button, Card, Form, Nav, Container, Row, Col } from "react-bootstrap";
import { updateProject } from "../../lib/api";
import history from "../../lib/history";
import useInputForm, { string } from "../../lib/useInputForm";

const AdminProjectEdit = function({ project, reloadProjectsList }) {
  const canSaveProject = ({ name }) => name;

  const saveProject = async function(values) {
    if (!canSaveProject(values)) return;

    await updateProject({
      project: {
        id: project.id,
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
    name: project ? project.name : ""
  });

  return (
    <Container fluid className="h-100">
      <Row className="pt-3 p-2">
        <Col>
          <Card className="w-100">
            <Card.Header>
              <Nav className="justify-content-between">
                <Nav.Item>
                  <h3>Edit Project</h3>
                </Nav.Item>
                <Nav.Item />
              </Nav>
            </Card.Header>
            <Card.Body>
              <Form noValidate>
                <Form.Group>
                  <Form.Label>Project Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Project Name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    isInvalid={touched.name && errors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    Project Name is required
                  </Form.Control.Feedback>
                </Form.Group>
              </Form>
            </Card.Body>
            <Card.Footer>
              <Nav className="justify-content-between">
                <Nav.Item>
                  <Button variant="success" onClick={handleSubmit}>
                    保存
                  </Button>{" "}
                  <Button variant="outline-secondary" onClick={history.goBack}>
                    キャンセル
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

export default AdminProjectEdit;
