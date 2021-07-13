import React from "react";
import { Button, Card, Nav, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";
import { fetchTemplates } from "../../lib/api";
import { apiContainerFactory } from "../../lib/apiContainerFactory";
import Loading from "../Loading";

export function AdminProjectTemplates({
  resource: taskTemplates,
  project,
  loading
}) {
  const { t } = useTranslation();
  if (loading) {
    return <Loading global />;
  }

  return (
    <Card className="w-100">
      <Card.Header>
        <Nav className="justify-content-between">
          <h3>{t("templates")}</h3>
          <Nav.Item>
            <LinkContainer
              to={`/admin/projects/${project.id}/taskTemplates/new`}
            >
              <Button variant="outline-success">{t("new-template")}</Button>
            </LinkContainer>
          </Nav.Item>
        </Nav>
      </Card.Header>
      <Card.Body>
        <Table striped>
          <thead>
            <tr>
              <th>{t("id")}</th>
              <th>{t("template-name")}</th>
              <th>{t("description")}</th>
            </tr>
          </thead>
          <tbody>
            {taskTemplates.map(template => (
              <tr key={template.id}>
                <td>
                  <Link
                    to={`/admin/projects/${project.id}/taskTemplates/${
                      template.id
                    }`}
                  >
                    {template.id}
                  </Link>
                </td>
                <td>
                  <Link
                    to={`/admin/projects/${project.id}/taskTemplates/${
                      template.id
                    }`}
                  >
                    {template.name}
                  </Link>
                </td>
                <td>{template.description}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

export default apiContainerFactory(AdminProjectTemplates, fetchTemplates);
