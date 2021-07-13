import React from "react";
import { Button, Card, Col, ListGroup, Nav, Row, Modal } from "react-bootstrap";
import { parseDate } from "../../lib/utils";
import { refreshMediaItems } from "../../lib/api";
import { JobTask } from "../../lib/models";
import { useTranslation } from "react-i18next";

export function AdminProjectMediaSourceFetch({
  projectId,
  mediaSource,
  fetchJobs = [],
  reload
}) {
  const { t } = useTranslation();
  const [showRefreshModal, setShowRefreshModal] = React.useState(false);
  const handleCloseModal = function() {
    setShowRefreshModal(false);
  };
  const handleClickRefreshMediaItems = function() {
    setShowRefreshModal(true);
  };
  const handleRefreshMediaItems = async function() {
    await refreshMediaItems({
      projectId,
      mediaSourceId: mediaSource.id
    });
    handleCloseModal();
    reload();
  };

  return (
    <>
      <Card className="w-100">
        <Card.Header>
          <Nav className="justify-content-between">
            <Nav.Item>
              <span>{t("last-refreshes")}</span>
            </Nav.Item>
            <Nav.Item>
              <Button
                variant="outline-success"
                onClick={handleClickRefreshMediaItems}
              >
                {t("refresh-now")}
              </Button>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <ListGroup variant="flush">
          {fetchJobs.map(job => (
            <ListGroup.Item key={job.id}>
              <Row className="align-items-center">
                <Col>{job.id}</Col>
                <Col>{JobTask.TYPE_TEXT[job.type]}</Col>
                <Col>{JobTask.STATUS_TEXT[job.status]}</Col>
                <Col>{JSON.stringify(job.config.result)}</Col>
                <Col>
                  <div>
                    <small>
                      {t("created")}: {parseDate(job.createdAt)}
                    </small>
                  </div>
                  <div>
                    <small>
                      {t("started")}:{" "}
                      {job.startedAt ? parseDate(job.startedAt) : "--"}
                    </small>
                  </div>
                  <div>
                    <small>
                      {t("finished")}:{" "}
                      {job.finishedAt ? parseDate(job.finishedAt) : "--"}
                    </small>
                  </div>
                </Col>
              </Row>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card>
      <Modal show={showRefreshModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{t("refresh-media-items")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t("refresh-media-items-1", { path: mediaSource.config.path })}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            {t("close-button")}
          </Button>
          <Button variant="success" onClick={handleRefreshMediaItems}>
            {t("refresh-media-items")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AdminProjectMediaSourceFetch;
