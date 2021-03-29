import React from "react";
import { Button, Card, Form, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { fetchMediaSource, updateMediaSource } from "../../lib/api";
import { apiContainerFactory } from "../../lib/apiContainerFactory";
import history from "../../lib/history";
import useInputForm, { string } from "../../lib/useInputForm";
import Loading from "../Loading";

function AdminProjectMediaSourceEdit({
  resource: mediaSource,
  project,
  loading
}) {
  const canSaveMediaSource = ({ name, description }) => name && description;

  const saveMediaSource = async function(values) {
    if (!canSaveMediaSource(values)) return;

    await updateMediaSource({
      projectId: project.id,
      mediaSource: {
        id: mediaSource.id,
        name: values.name,
        description: values.description
      }
    });

    history.push(
      `/admin/projects/${project.id}/mediaSources/${mediaSource.id}`
    );
  };

  const formSchema = {
    name: string().required(),
    description: string().required()
  };

  const [
    { values, touched, errors },
    handleChange,
    handleSubmit
  ] = useInputForm(saveMediaSource, formSchema, {
    name: mediaSource ? mediaSource.name : "",
    description: mediaSource ? mediaSource.description : ""
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Card className="w-100">
        <Card.Header>
          <Nav className="justify-content-between">
            <Nav.Item>
              <h3>
                <Link to={`/admin/projects/${project.id}`}>Media Sources</Link>
                {" :: "}
                <Link
                  to={`/admin/projects/${project.id}/mediaSources/${
                    mediaSource.id
                  }`}
                >
                  {mediaSource.name}
                </Link>
                {" :: "}
                <span>Edit</span>
              </h3>
            </Nav.Item>
            <Nav.Item />
          </Nav>
        </Card.Header>
        <Card.Body>
          <Form noValidate>
            <Form.Group>
              <Form.Label>Media Source Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Media Source Name"
                name="name"
                value={values.name}
                onChange={handleChange}
                isInvalid={touched.name && errors.name}
              />
              <Form.Control.Feedback type="invalid">
                Media Name is required
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Media Source Description"
                name="description"
                value={values.description}
                onChange={handleChange}
                isInvalid={touched.description && errors.description}
              />
              <Form.Control.Feedback type="invalid">
                Media Source description is required
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Card.Body>
        <Card.Footer>
          <Nav className="justify-content-between">
            <Nav.Item>
              <Button variant="success" onClick={handleSubmit}>
                Save
              </Button>{" "}
              <Button
                variant="outline-secondary"
                onClick={() => history.goBack()}
              >
                Cancel
              </Button>
            </Nav.Item>
            <Nav.Item />
          </Nav>
        </Card.Footer>
      </Card>
    </>
  );
}

export default apiContainerFactory(
  AdminProjectMediaSourceEdit,
  fetchMediaSource
);
