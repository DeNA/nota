import Loading from "../Loading";
import { fetchMediaSources } from "../../lib/api";
import { apiContainerFactory } from "../../lib/apiContainerFactory";
import { MediaSource } from "../../lib/models";
import React from "react";
import { Button, Card, Nav, Table } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";
import useIntervalReload from "../../lib/useIntervalReload";
import MeContext from "../MeContext";

export function AdminProjectMediaSources({
  resource: mediaSources,
  project,
  loading,
  doGet,
  params
}) {
  const me = React.useContext(MeContext);
  const shouldReload =
    mediaSources &&
    mediaSources.some(mediaSource =>
      [MediaSource.STATUS.CREATING, MediaSource.STATUS.UPDATING].includes(
        mediaSource.status
      )
    );
  useIntervalReload(() => {
    doGet(params);
  }, shouldReload);
  if (!mediaSources && loading) {
    return <Loading global />;
  }

  return (
    <Card className="w-100">
      <Card.Header>
        <Nav className="justify-content-between">
          <h3>Media Sources</h3>
          <Nav.Item>
            {me.isAppAdmin && (
              <LinkContainer
                to={`/admin/projects/${project.id}/mediaSources/new`}
              >
                <Button variant="outline-success">New Media Source</Button>
              </LinkContainer>
            )}
          </Nav.Item>
        </Nav>
      </Card.Header>
      <Card.Body>
        <Table striped>
          <thead>
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th>Status</th>
              <th>Source</th>
              <th>Path</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {mediaSources.map(mediaSource => (
              <tr key={mediaSource.id}>
                <td>
                  <Link
                    to={`/admin/projects/${project.id}/mediaSources/${
                      mediaSource.id
                    }`}
                  >
                    {mediaSource.id}
                  </Link>
                </td>
                <td>
                  <Link
                    to={`/admin/projects/${project.id}/mediaSources/${
                      mediaSource.id
                    }`}
                  >
                    {mediaSource.name}
                  </Link>
                </td>
                <td>{MediaSource.STATUS_TEXT[mediaSource.status]}</td>
                <td>{mediaSource.datasource}</td>
                <td>
                  <code>
                    {`${mediaSource.datasource}://`}
                    {mediaSource.config.bucket
                      ? `${mediaSource.config.bucket}/`
                      : ""}
                    {mediaSource.config.path}
                  </code>
                </td>
                <td>{mediaSource.description}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

export default apiContainerFactory(AdminProjectMediaSources, fetchMediaSources);
