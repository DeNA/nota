import React from "react";
import { Alert, Button, Card, Form, InputGroup, Nav } from "react-bootstrap";
import { useTranslation, Trans } from "react-i18next";
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
  const { t } = useTranslation();
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
                {t("media-sources")}
              </Link>
              {" :: " + t("new-media-source")}
            </h3>
          </Nav.Item>
          <Nav.Item />
        </Nav>
      </Card.Header>
      <Card.Body>
        <Form noValidate>
          <Form.Group>
            <Form.Label>{t("media-source-name")}</Form.Label>
            <Form.Control
              type="text"
              placeholder={t("media-source-name")}
              name="name"
              value={values.name}
              onChange={handleChange}
              isInvalid={touched.name && errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {t("required-error", { field: t("media-source-name") })}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>{t("media-source-description")}</Form.Label>
            <Form.Control
              as="textarea"
              placeholder={t("media-source-description")}
              name="description"
              value={values.description}
              onChange={handleChange}
              isInvalid={touched.description && errors.description}
            />
            <Form.Control.Feedback type="invalid">
              {t("required-error", { field: t("media-source-description") })}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>{t("metadata-filters")} (JSON)</Form.Label>
            <Form.Control
              as="textarea"
              placeholder={t("metadata-filters")}
              name="filters"
              value={values.filters}
              onChange={handleChange}
              isInvalid={touched.filters && errors.filters}
            />
            <Form.Text className="text-muted">
              {t("example")}
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
              {t("invalid-error", { field: t("metadata-filters") })}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>{t("allowed-extensions")}</Form.Label>
            <Form.Control
              type="text"
              placeholder="jpg,png"
              name="extensions"
              value={values.extensions}
              onChange={handleChange}
              isInvalid={touched.extensions && errors.extensions}
            />
            <Form.Control.Feedback type="invalid">
              {t("required-error", { field: t("allowed-extensions") })}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>{t("datasource-type")}</Form.Label>
            <Form.Control
              disabled
              type="text"
              placeholder={t("datasource-type")}
              name="type"
              value={values.type}
              isInvalid={touched.type && errors.type}
            />
            <Form.Control.Feedback type="invalid">
              {t("required-error", { field: t("datasource-type") })}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>{t("s3-bucket")}</Form.Label>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>s3://</InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control
                type="text"
                placeholder={t("bucket-name")}
                name="bucket"
                value={values.bucket}
                onChange={handleChange}
                isInvalid={touched.bucket && errors.bucket}
              />
              <Form.Control.Feedback type="invalid">
                {t("required-error", { field: t("s3-bucket") })}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group>
            <Form.Label>{t("path")}</Form.Label>
            <Form.Control
              type="text"
              placeholder="path/to/root/folder"
              name="path"
              value={values.path}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>{t("export-path")}</Form.Label>
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
            <Trans
              i18nKey="media-source-check-1"
              values={{ values }}
              components={{
                code: <code />
              }}
            />
            <br />
            <Trans
              i18nKey="media-source-check-2"
              values={{ values }}
              components={{
                code: <code />
              }}
            />
          </Alert>
        )}
        <Nav className="justify-content-between">
          <Nav.Item>
            <Button variant="success" onClick={handleSubmit}>
              {t("create-media-source")}
            </Button>{" "}
            <Button variant="outline-secondary" onClick={history.goBack}>
              {t("cancel-button")}
            </Button>
          </Nav.Item>
        </Nav>
      </Card.Footer>
    </Card>
  );
};

export default AdminProjectMediaSourceNew;
