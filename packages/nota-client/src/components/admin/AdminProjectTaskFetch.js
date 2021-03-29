import React from "react";
import { Button, Card, Col, ListGroup, Nav, Row, Modal } from "react-bootstrap";
import { parseDate } from "../../lib/utils";
import { refreshTaskItems } from "../../lib/api";
import { JobTask } from "../../lib/models";

export function AdminProjectTaskFetch({
  projectId,
  task,
  fetchJobs = [],
  reload
}) {
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
              <span>Last Refreshes</span>
            </Nav.Item>
            <Nav.Item>
              <Button variant="outline-success" onClick={handleClickRefresh}>
                Refresh Now
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
      <Modal show={showRefreshModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Refresh Task Items</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This will add any new item in <code>{task.mediaSourcePath}</code> to
          the task. It will not delete any item even if it no longer exists
          remotely.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="success" onClick={handleRefreshMediaItems}>
            Refresh Task Items
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AdminProjectTaskFetch;
