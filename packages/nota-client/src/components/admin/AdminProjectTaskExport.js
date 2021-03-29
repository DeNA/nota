import React, { useState } from "react";
import { Button, Card, Col, ListGroup, Nav, Row, Modal } from "react-bootstrap";
import { parseDate } from "../../lib/utils";
import { exportTaskResults } from "../../lib/api";
import { JobTask, Task } from "../../lib/models";
import Icon from "../Icon";

export function AdminProjectTaskExport({
  projectId,
  taskId,
  exportJobs = [],
  reload
}) {
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
              <span>Last Exports</span>
            </Nav.Item>
            <Nav.Item>
              <Button variant="outline-info" onClick={handleClickExport}>
                Export Now
              </Button>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <ListGroup variant="flush">
          {exportJobs.map(job => (
            <ListGroup.Item key={job.id}>
              <Row className="align-items-center">
                <Col sm="1">{job.id}</Col>
                <Col sm="1">{JobTask.TYPE_TEXT[job.type]}</Col>
                <Col sm="2">{JobTask.STATUS_TEXT[job.status]}</Col>
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
                    <small>Created: {parseDate(job.createdAt)}</small>
                  </div>
                  <div>
                    <small>
                      Started: {job.startedAt ? parseDate(job.startedAt) : "--"}
                    </small>
                  </div>
                  <div>
                    <small>
                      Finished:{" "}
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
          <Modal.Title>Export Task Results</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This will export completed Task Items to the defined export path
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="mr-5"
            variant="secondary"
            onClick={handleCloseModal}
          >
            Close
          </Button>
          <Button variant="outline-success" onClick={handleExportNew}>
            Export NEW, UPDATED Items
          </Button>
          <Button variant="outline-success" onClick={handleExportAll}>
            Export ALL Items
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AdminProjectTaskExport;
