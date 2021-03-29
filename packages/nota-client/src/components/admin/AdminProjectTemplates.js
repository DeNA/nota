import React from "react";
import { Button, Card, Nav, Table } from "react-bootstrap";
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
  if (loading) {
    return <Loading global />;
  }

  return (
    <Card className="w-100">
      <Card.Header>
        <Nav className="justify-content-between">
          <h3>Templates</h3>
          <Nav.Item>
            <LinkContainer
              to={`/admin/projects/${project.id}/taskTemplates/new`}
            >
              <Button variant="outline-success">New Template</Button>
            </LinkContainer>
          </Nav.Item>
        </Nav>
      </Card.Header>
      <Card.Body>
        <Table striped>
          <thead>
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th>Description</th>
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
