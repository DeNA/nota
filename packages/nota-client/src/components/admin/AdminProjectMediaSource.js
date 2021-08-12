import React from "react";
import { Button, Card, Col, Container, Nav, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";
import { fetchMediaSource } from "../../lib/api";
import { apiContainerFactory } from "../../lib/apiContainerFactory";
import { MediaSource } from "../../lib/models";
import { parseDate } from "../../lib/utils";
import Loading from "../Loading";
import AdminProjectMediaSourceBranches from "./AdminProjectMediaSourceBranches";
import AdminProjectMediaSourceFetch from "./AdminProjectMediaSourceFetch";

export function AdminProjectMediaSource({
  resource: mediaSource,
  project,
  loading,
  doGet
}) {
  const { t } = useTranslation();
  const handleReload = function() {
    doGet({ projectId: project.id, mediaSourceId: mediaSource.id });
  };

  if (loading && !mediaSource) {
    return <Loading global />;
  }

  return (
    <>
      <Card className="w-100">
        {loading && <Loading />}
        <Card.Header>
          <Nav className="justify-content-between">
            <Nav.Item>
              <h3>
                <Link to={`/admin/projects/${project.id}/mediaSources`}>
                  {t("media-sources")}
                </Link>
                {" :: "}
                <span>{mediaSource.name}</span>
              </h3>
            </Nav.Item>
            <Nav.Item>
              <LinkContainer
                to={`/admin/projects/${project.id}/mediaSources/${
                  mediaSource.id
                }/edit`}
              >
                <Button variant="outline-info">{t("edit-button")}</Button>
              </LinkContainer>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <Card.Body>
          <Container>
            <Row>
              <Col>
                <Row>
                  <Col>
                    <Row>
                      <Col className="col-3 text-right">{t("created-by")}</Col>
                      <Col>
                        {mediaSource.createdBy.username} (
                        {parseDate(mediaSource.createdAt)})
                      </Col>
                    </Row>
                    <Row>
                      <Col className="col-3 text-right">{t("updated-by")}</Col>
                      <Col>
                        {mediaSource.createdBy.username} (
                        {parseDate(mediaSource.createdAt)})
                      </Col>
                    </Row>
                    <Row>
                      <Col className="col-3 text-right">{t("extensions")}</Col>
                      <Col>
                        <code>{mediaSource.config.extensions.join(",")}</code>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="col-3 text-right">{t("datasource")}</Col>
                      <Col>
                        <code>{mediaSource.datasource}</code>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="col-3 text-right">{t("bucket")}</Col>
                      <Col>
                        <code>{mediaSource.config.bucket}</code>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="col-3 text-right">{t("path")}</Col>
                      <Col>
                        <code>{mediaSource.config.path}</code>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="col-3 text-right">{t("export-path")}</Col>
                      <Col>
                        <code>{mediaSource.config.exportPath}</code>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="col-3 text-right">{t("filters")}</Col>
                      <Col>
                        <small>
                          {mediaSource.config.filters &&
                            mediaSource.config.filters.map(filter => (
                              <div key={filter.name}>
                                {filter.label} -- {filter.name} -- {filter.type}
                              </div>
                            ))}
                        </small>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="col-3 text-right">{t("status")}</Col>
                      <Col>
                        <code>
                          {MediaSource.STATUS_TEXT[mediaSource.status]}
                        </code>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
              <Col>
                <Row className="bg-light p-3 rounded">
                  {mediaSource.description}
                </Row>
              </Col>
            </Row>
          </Container>
        </Card.Body>
      </Card>
      <br />
      <AdminProjectMediaSourceBranches />
      <br />
      <AdminProjectMediaSourceFetch
        projectId={project.id}
        mediaSource={mediaSource}
        fetchJobs={mediaSource.fetchJobs}
        reload={handleReload}
      />
    </>
  );
}

export default apiContainerFactory(AdminProjectMediaSource, fetchMediaSource);
