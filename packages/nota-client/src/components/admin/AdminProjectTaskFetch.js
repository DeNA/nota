import React from "react";
import { Button, Card, Col, ListGroup, Modal, Nav, Row } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";
import { refreshTaskItems } from "../../lib/api";
import { JobTask } from "../../lib/models";
import { parseDate } from "../../lib/utils";

export function AdminProjectTaskFetch({
  projectId,
  task,
  fetchJobs = [],
  reload
}) {
  const { t } = useTranslation();
  const [showRefreshModal, setShowRefreshModal] = React.useState(false);

  const handleRefreshMediaItems = async function() {
    await refreshTaskItems({
      projectId,
      taskId: task.id
    });
    setShowRefreshModal(false);
    reload();
  };
  const handleClickRefresh = async function() {
    setShowRefreshModal(true);
  };
  const handleCloseModal = function() {
    setShowRefreshModal(false);
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
              <Button variant="outline-success" onClick={handleClickRefresh}>
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
                <Col>{t(JobTask.TYPE_TEXT[job.type])}</Col>
                <Col>{t(JobTask.STATUS_TEXT[job.status])}</Col>
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
          <Modal.Title>{t("refresh-task-items")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Trans
            i18nKey="refresh-task-items-1"
            values={{ task }}
            components={{ code: <code /> }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            {t("close-button")}
          </Button>
          <Button variant="success" onClick={handleRefreshMediaItems}>
            {t("refresh-task-items")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AdminProjectTaskFetch;
