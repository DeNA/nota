import React from "react";
import { Badge, Button, Card, Col, Form, Nav, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  countMediaItems,
  fetchMediaSources,
  fetchTemplates,
  persistTask
} from "../../lib/api";
import { apiContainerFactory } from "../../lib/apiContainerFactory";
import history from "../../lib/history";
import useInputForm, { integer, string } from "../../lib/useInputForm";
import Loading from "../Loading";
import { Filters } from "./Filters";
import MediaSourceItemsTree from "./MediaSourceItemsTree";

function AdminProjectTaskNew({ resource, project, loading }) {
  const [count, setCount] = React.useState(null);
  const [filterConditions, setFilterConditions] = React.useState({});
  const [excludeAlreadyUsed, setExcludeAlreadyUsed] = React.useState(false);
  const { templates, mediaSources } = resource || {
    templates: null,
    mediaSources: null
  };
  const canSaveTask = ({
    name,
    description,
    templateId,
    mediaSourceId,
    mediaSourceSelectedPath
  }) =>
    name &&
    description &&
    templateId &&
    mediaSourceId &&
    mediaSourceSelectedPath;

  const saveTask = async function(values) {
    if (!canSaveTask(values)) return;

    const conditions = {};
    Object.keys(filterConditions).forEach(key => {
      conditions[key] = [filterConditions[key]];
    });

    await persistTask({
      projectId: project.id,
      mediaSourceId: values.mediaSourceId,
      name: values.name,
      description: values.description,
      options: {
        taskTemplateId: values.templateId,
        path: values.mediaSourceSelectedPath,
        excludeAlreadyUsed,
        limit: null
      },
      conditions
    });

    history.push(`/admin/projects/${project.id}`);
  };
  const handleCountItems = async function() {
    const conditions = {};
    Object.keys(filterConditions).forEach(key => {
      conditions[key] = [filterConditions[key]];
    });
    const result = await countMediaItems({
      projectId: project.id,
      mediaSourceId: values.mediaSourceId,
      options: {
        taskTemplateId: values.templateId,
        path: values.mediaSourceSelectedPath,
        excludeAlreadyUsed,
        limit: null
      },
      conditions
    });

    setCount(result.items);
  };

  const formSchema = {
    name: string().required(),
    description: string().required(),
    templateId: integer().required(),
    mediaSourceId: string().required(),
    mediaSourceSelectedPath: string().required()
  };

  const [
    { values, touched, errors },
    handleChange,
    handleSubmit
  ] = useInputForm(saveTask, formSchema, {
    name: "",
    description: "",
    templateId: "",
    mediaSourceId: "",
    mediaSourceSelectedPath: ""
  });
  const mediaSource =
    values.mediaSourceId &&
    mediaSources.find(source => source.id === parseInt(values.mediaSourceId));
  const taskTemplate =
    values.templateId &&
    templates.find(template => template.id === parseInt(values.templateId));
  const filters =
    mediaSource && mediaSource.config && mediaSource.config.filters;

  const handleChangeMediaSourceSelectedPath = function(path) {
    handleChange({ target: { name: "mediaSourceSelectedPath", value: path } });
  };
  const handleChangeExcludeAlreadyUsed = function(evt) {
    setExcludeAlreadyUsed(evt.target.checked);
  };
  const filterConditionsString = JSON.stringify(filterConditions);

  React.useEffect(() => {
    setCount(null);
  }, [
    values.templateId,
    values.mediaSourceId,
    values.mediaSourceSelectedPath,
    filterConditionsString,
    excludeAlreadyUsed
  ]);

  if (loading) {
    return <Loading />;
  }

  return (
    <Card className="w-100">
      <Card.Header>
        <Nav className="justify-content-between">
          <Nav.Item>
            <h3>
              <Link to={`/admin/projects/${project.id}`}>Tasks</Link>
              {" :: "}
              <span>New Task</span>
            </h3>
          </Nav.Item>
          <Nav.Item />
        </Nav>
      </Card.Header>
      <Card.Body>
        <Form noValidate>
          <Form.Group>
            <Form.Label>タスク名</Form.Label>
            <Form.Control
              type="text"
              placeholder="タスク名"
              name="name"
              value={values.name}
              onChange={handleChange}
              isInvalid={touched.name && errors.name}
            />
            <Form.Control.Feedback type="invalid">
              タスク名は必須です
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>詳細</Form.Label>
            <Form.Control
              as="textarea"
              placeholder="詳細"
              name="description"
              value={values.description}
              onChange={handleChange}
              isInvalid={touched.description && errors.description}
            />
            <Form.Control.Feedback type="invalid">
              詳細は必須です
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>テンプレート</Form.Label>
            <Form.Control
              as="select"
              value={values.templateId}
              name="templateId"
              onChange={handleChange}
              isInvalid={touched.templateId && errors.templateId}
            >
              <option value="">テンプレート...</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              テンプレートは必須です
            </Form.Control.Feedback>
          </Form.Group>
          {taskTemplate && (
            <>
              <Row>
                <Col>
                  <Form.Group>
                    <Form.Label>データソース</Form.Label>
                    <Form.Control
                      as="select"
                      value={values.mediaSourceId}
                      name="mediaSourceId"
                      onChange={handleChange}
                      isInvalid={touched.mediaSourceId && errors.mediaSourceId}
                    >
                      <option value="">ソース...</option>
                      {mediaSources.map(source => (
                        <option key={source.id} value={source.id}>
                          {source.name}
                        </option>
                      ))}
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                      ソースは必須です
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col>
                  {mediaSource && (
                    <Row>
                      <Col>
                        <Form.Group>
                          <Form.Label>フォルダー選択</Form.Label>
                          <Form.Control
                            type="text"
                            disabled
                            placeholder="No folder selected"
                            value={values.mediaSourceSelectedPath}
                            name="mediaSourceSelectedPath"
                            onChange={handleChange}
                            isInvalid={
                              touched.mediaSourceSelectedPath &&
                              errors.mediaSourceSelectedPath
                            }
                          />
                          <Form.Control.Feedback type="invalid">
                            フォルダーは必須です
                          </Form.Control.Feedback>
                        </Form.Group>
                        <MediaSourceItemsTree
                          projectId={project.id}
                          mediaSourceId={mediaSource.id}
                          key={mediaSource.id}
                          selectedPath={values.mediaSourceSelectedPath}
                          selectPath={handleChangeMediaSourceSelectedPath}
                        />
                      </Col>
                    </Row>
                  )}
                </Col>
              </Row>
              {mediaSource && (
                <Row className="mb-4">
                  <Col>
                    <Card>
                      <Card.Header className="cursor-pointer">
                        Options
                      </Card.Header>
                      <Card.Body>
                        {filters && (
                          <Filters
                            filters={filters}
                            filterConditions={filterConditions}
                            setFilterConditions={setFilterConditions}
                          />
                        )}
                        <Form.Group as={Row}>
                          <Form.Label column sm={2}>
                            Exclude already used
                          </Form.Label>
                          <Col sm={10}>
                            <Form.Check
                              type="checkbox"
                              id="excludeAlreadyUsed"
                              checked={excludeAlreadyUsed}
                              onChange={handleChangeExcludeAlreadyUsed}
                            />
                          </Col>
                        </Form.Group>
                        <h3>
                          <Button
                            variant="info"
                            onClick={handleCountItems}
                            className="mr-2"
                          >
                            Count Items
                          </Button>
                          <Badge pill variant="secondary">
                            {count === null ? "--" : `${count} items`}
                          </Badge>
                        </h3>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}
            </>
          )}
        </Form>
      </Card.Body>
      <Card.Footer>
        <Nav className="justify-content-between">
          <Nav.Item>
            <Button variant="success" onClick={handleSubmit}>
              タスク作成
            </Button>{" "}
            <Button variant="outline-secondary" onClick={history.goBack}>
              キャンセル
            </Button>
          </Nav.Item>
        </Nav>
      </Card.Footer>
    </Card>
  );
}

const fetchDependencies = async function(params) {
  const [templates, mediaSources] = await Promise.all([
    fetchTemplates(params),
    fetchMediaSources(params)
  ]);

  return { templates, mediaSources };
};
export default apiContainerFactory(AdminProjectTaskNew, fetchDependencies);
