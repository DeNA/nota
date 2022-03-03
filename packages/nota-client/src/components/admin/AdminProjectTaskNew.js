import React from "react";
import { Badge, Button, Card, Col, Form, Nav, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  countMediaItems,
  fetchMediaSources,
  fetchTemplates,
  persistTask
} from "../../lib/api";
import { apiContainerFactory } from "../../lib/apiContainerFactory";
import history from "../../lib/history";
import useInputForm, { integer, string, url } from "../../lib/useInputForm";
import Loading from "../Loading";
import { Filters } from "./Filters";
import { Task } from "../../lib/models";
import MediaSourceItemsTree from "./MediaSourceItemsTree";

function AdminProjectTaskNew({ resource, project, loading }) {
  const { t } = useTranslation();
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
    mediaSourceSelectedPath,
    assignmentDefaultItems,
    assignmentDefaultOrder
  }) =>
    name &&
    description &&
    templateId &&
    mediaSourceId &&
    mediaSourceSelectedPath &&
    assignmentDefaultItems &&
    assignmentDefaultOrder;

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
      conditions,
      assignmentDefaultItems: Math.max(
        parseInt(values.assignmentDefaultItems),
        Task.MIN_ASSIGNMENT_SIZE
      ),
      assignmentDefaultOrder: values.assignmentDefaultOrder,
      manualUrl: values.manualUrl
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
    manualUrl: url(),
    templateId: integer().required(),
    mediaSourceId: string().required(),
    mediaSourceSelectedPath: string().required(),
    assignmentDefaultItems: integer().required(),
    assignmentDefaultOrder: string().required()
  };

  const [
    { values, touched, errors },
    handleChange,
    handleSubmit
  ] = useInputForm(saveTask, formSchema, {
    name: "",
    description: "",
    manualUrl: "",
    templateId: "",
    mediaSourceId: "",
    mediaSourceSelectedPath: "",
    assignmentDefaultItems: Task.DEFAULT_ASSIGNMENT_SIZE,
    assignmentDefaultOrder: Task.DEFAULT_ASSIGNMENT_ORDER
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
              <Link to={`/admin/projects/${project.id}`}>{t("tasks")}</Link>
              {" :: "}
              <span>{t("new-task")}</span>
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
              {t("invalid-error", { field: t("task-manualUrl") })}
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
                touched.assignmentDefaultItems && errors.assignmentDefaultItems
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
                touched.assignmentDefaultOrder && errors.assignmentDefaultOrder
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
            <Form.Label>{t("template")}</Form.Label>
            <Form.Control
              as="select"
              value={values.templateId}
              name="templateId"
              onChange={handleChange}
              isInvalid={touched.templateId && errors.templateId}
            >
              <option value="">{t("template")}...</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              {t("required-error", { field: t("template") })}
            </Form.Control.Feedback>
          </Form.Group>
          {taskTemplate && (
            <>
              <Row>
                <Col>
                  <Form.Group>
                    <Form.Label>{t("datasource")}</Form.Label>
                    <Form.Control
                      as="select"
                      value={values.mediaSourceId}
                      name="mediaSourceId"
                      onChange={handleChange}
                      isInvalid={touched.mediaSourceId && errors.mediaSourceId}
                    >
                      <option value="">{t("datasource")}...</option>
                      {mediaSources.map(source => (
                        <option key={source.id} value={source.id}>
                          {source.name}
                        </option>
                      ))}
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                      {t("required-error", { field: t("datasource") })}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col>
                  {mediaSource && (
                    <Row>
                      <Col>
                        <Form.Group>
                          <Form.Label>{t("path-selection")}</Form.Label>
                          <Form.Control
                            type="text"
                            disabled
                            placeholder={t("no-path-selected")}
                            value={values.mediaSourceSelectedPath}
                            name="mediaSourceSelectedPath"
                            onChange={handleChange}
                            isInvalid={
                              touched.mediaSourceSelectedPath &&
                              errors.mediaSourceSelectedPath
                            }
                          />
                          <Form.Control.Feedback type="invalid">
                            {t("required-error", { field: t("path") })}
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
                        {t("options")}
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
                            {t("exclude-used")}
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
                            {t("count-items")}
                          </Button>
                          <Badge pill variant="secondary">
                            {count === null ? "--" : `${count} ${t("items")}`}
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
              {t("create-task")}
            </Button>{" "}
            <Button variant="outline-secondary" onClick={history.goBack}>
              {t("cancel-button")}
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
