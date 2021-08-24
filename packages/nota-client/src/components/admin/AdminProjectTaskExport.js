import React, { useState } from "react";
import { Button, Card, Col, ListGroup, Modal, Nav, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { exportTaskResults } from "../../lib/api";
import { JobTask, Task } from "../../lib/models";
import { parseDate } from "../../lib/utils";
import Icon from "../Icon";

export function AdminProjectTaskExport({
  projectId,
  taskId,
  exportJobs = [],
  reload
}) {
  const { t } = useTranslation();
  const [showExportModal, setShowExportModal] = useState(false);
  const handleExportAll = () => handleExport(Task.EXPORT_TARGET.ALL);
  const handleExportNew = () =>
    handleExport(Task.EXPORT_TARGET.NEW_AND_UPDATED);
  const handleExport = async function(target) {
    await exportTaskResults({
      projectId,
      taskId,
      options: { target }
    });
    reload();
    setShowExportModal(false);
  };
  const handleClickExport = async function() {
    setShowExportModal(true);
  };
  const handleCloseModal = function() {
    setShowExportModal(false);
  };

  return (
    <>
      <Card className="w-100">
        <Card.Header>
          <Nav className="justify-content-between">
            <Nav.Item>
              <span>{t("last-exports")}</span>
            </Nav.Item>
            <Nav.Item>
              <Button variant="outline-info" onClick={handleClickExport}>
                {t("export-now")}
              </Button>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <ListGroup variant="flush">
          {exportJobs.map(job => (
            <ListGroup.Item key={job.id}>
              <Row className="align-items-center">
                <Col sm="1">{job.id}</Col>
                <Col sm="1">{t(JobTask.TYPE_TEXT[job.type])}</Col>
                <Col sm="2">{t(JobTask.STATUS_TEXT[job.status])}</Col>
                <Col sm="4">
                  {job.config.result && job.config.result.file ? (
                    <a
                      title="Download..."
                      href={`/api/projects/${projectId}/tasks/${taskId}/download/${
                        job.id
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {job.config.result.file}{" "}
                      <Icon name="arrow-circle-bottom" />
                    </a>
                  ) : (
                    ""
                  )}
                </Col>
                <Col sm="1">
                  {job.status === JobTask.STATUS.OK
                    ? job.config.result.count
                    : "0"}
                </Col>
                <Col sm="3">
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
      <Modal show={showExportModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{t("export-task-results")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{t("export-task-results-1")}</Modal.Body>
        <Modal.Footer>
          <Button
            className="mr-5"
            variant="secondary"
            onClick={handleCloseModal}
          >
            {t("close-button")}
          </Button>
          <Button variant="outline-success" onClick={handleExportNew}>
            {t("export-task-results-2")}
          </Button>
          <Button variant="outline-success" onClick={handleExportAll}>
            {t("export-task-results-3")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AdminProjectTaskExport;
