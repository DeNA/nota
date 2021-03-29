import React from "react";
import { Alert, Button, Card, Form, InputGroup, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { persistMediaSource } from "../../lib/api";
import history from "../../lib/history";
import useInputForm, { string } from "../../lib/useInputForm";

const AdminProjectMediaSourceNew = function({ project }) {
  const canSaveMediaSource = ({
    name,
    description,
    type,
    extensions,
    bucket
  }) => name && description && type && extensions && bucket;

  const saveMediaSource = async function(values) {
    if (!canSaveMediaSource(values)) return;

    await persistMediaSource({
      projectId: project.id,
      mediaSource: {
        name: values.name,
        description: values.description,
        type: values.type,
        config: {
          extensions: values.extensions
            .split(",")
            .map(ext => ext.trim())
            .filter(ext => !!ext),
          bucket: values.bucket,
          path: values.path || "",
          exportPath: values.exportPath || "",
          filters: values.filters ? JSON.parse(values.filters) : undefined
        }
      }
    });
    history.push(`/admin/projects/${project.id}/mediaSources`);
  };
  const formSchema = {
    name: string().required(),
    description: string().required(),
    type: string().required(),
    extensions: string().required(),
    bucket: string().required(),
    path: string(),
    exportPath: string(),
    filters: string()
  };
  const [
    { values, touched, errors },
    handleChange,
    handleSubmit
  ] = useInputForm(saveMediaSource, formSchema, {
    name: "",
    description: "",
    type: "s3",
    extensions: "",
    bucket: "",
    path: "",
    exportPath: "",
    filters: ""
  });

  return (
    <Card className="w-100">
      <Card.Header>
        <Nav className="justify-content-between">
          <Nav.Item>
            <h3>
              <Link to={`/admin/projects/${project.id}/mediaSources`}>
                Media Sources
              </Link>
              {" :: New Media Source"}
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
          <Form.Group>
            <Form.Label>Metadata Filters (JSON)</Form.Label>
            <Form.Control
              as="textarea"
              placeholder="Metadata Filters"
              name="filters"
              value={values.filters}
              onChange={handleChange}
              isInvalid={touched.filters && errors.filters}
            />
            <Form.Text className="text-muted">
              Example
              <br />
              <code>
                {`[`}
                <br />
                &nbsp;&nbsp;
                {`{ "name": "stringFilter", "label": "string Filter", "type":1 },`}
                <br />
                &nbsp;&nbsp;
                {`{ "name": "integerFilter", "label": "integer Filter", "type":2 },`}
                <br />
                &nbsp;&nbsp;
                {`{ "name": "datetimeFilter", "label": "datetime Filter", "type":3 }`}
                <br />
                {`]`}
              </code>
            </Form.Text>
            <Form.Control.Feedback type="invalid">
              Filters is invalid
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>Allowed file extensions (comma separated)</Form.Label>
            <Form.Control
              type="text"
              placeholder="jpg,png"
              name="extensions"
              value={values.extensions}
              onChange={handleChange}
              isInvalid={touched.extensions && errors.extensions}
            />
            <Form.Control.Feedback type="invalid">
              Media Name is required
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>Datasource Type</Form.Label>
            <Form.Control
              disabled
              type="text"
              placeholder="Datasource Type"
              name="type"
              value={values.type}
              isInvalid={touched.type && errors.type}
            />
            <Form.Control.Feedback type="invalid">
              Datasource Type is required
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>S3 bucket</Form.Label>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>s3://</InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control
                type="text"
                placeholder="bucket-name"
                name="bucket"
                value={values.bucket}
                onChange={handleChange}
                isInvalid={touched.bucket && errors.bucket}
              />
              <Form.Control.Feedback type="invalid">
                Bucket is required
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group>
            <Form.Label>Media Files Path</Form.Label>
            <Form.Control
              type="text"
              placeholder="path/to/root/folder"
              name="path"
              value={values.path}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Export Path</Form.Label>
            <Form.Control
              type="text"
              placeholder="path/to/export/folder"
              name="exportPath"
              value={values.exportPath}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Card.Body>
      <Card.Footer>
        {canSaveMediaSource(values) && (
          <Alert variant="info">
            All <code>{values.extensions}</code> files under{" "}
            <code>
              s3://{values.bucket}/{values.path}
            </code>{" "}
            will be indexed
            <br />
            Annotation data will be exported to{" "}
            <code>
              s3://{values.bucket}/{values.exportPath}
            </code>
          </Alert>
        )}
        <Nav className="justify-content-between">
          <Nav.Item>
            <Button variant="success" onClick={handleSubmit}>
              Create Media Source
            </Button>{" "}
            <Button variant="outline-secondary" onClick={history.goBack}>
              Cancel
            </Button>
          </Nav.Item>
        </Nav>
      </Card.Footer>
    </Card>
  );
};

export default AdminProjectMediaSourceNew;
