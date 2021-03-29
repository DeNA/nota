import React from "react";
import { Button, Col, Nav, Row, Card } from "react-bootstrap";
import { ProjectGroup } from "../../lib/models";
import GroupsEdit from "./GroupsEdit";
import { updateProject } from "../../lib/api";

function AdminProjectGroups({ project, reload }) {
  const annotatorGroups = project.groups
    .filter(group => group.type === ProjectGroup.TYPE.ANNOTATOR)
    .map(group => group.name);
  const adminGroups = project.groups
    .filter(group => group.type === ProjectGroup.TYPE.PROJECT_ADMIN)
    .map(group => group.name);
  const [updating, setUpdating] = React.useState(false);
  const [updatedAdminGroups, setUpdatedAdminGroups] = React.useState(null);
  const [updatedAnnotatorGroups, setUpdatedAnnotatorGroups] = React.useState(
    null
  );
  const hasChanged =
    updatedAdminGroups !== null || updatedAnnotatorGroups !== null;

  const handleAnnotatorGroupsChange = function(groups) {
    setUpdatedAnnotatorGroups(groups);
  };

  const handleAdminGroupsChange = function(groups) {
    setUpdatedAdminGroups(groups);
  };

  const handleCancel = function() {
    setUpdatedAdminGroups(null);
    setUpdatedAnnotatorGroups(null);
  };

  const handleSave = async function() {
    if (!hasChanged) return;

    setUpdating(true);
    const saveAdminGroups = (updatedAdminGroups || adminGroups).map(group => ({
      type: ProjectGroup.TYPE.PROJECT_ADMIN,
      name: group
    }));
    const saveAnnotatorGroups = (updatedAnnotatorGroups || annotatorGroups).map(
      group => ({ type: ProjectGroup.TYPE.ANNOTATOR, name: group })
    );
    await updateProject({
      project: {
        id: project.id,
        groups: [...saveAdminGroups, ...saveAnnotatorGroups]
      }
    });
    handleCancel();
    setUpdating(false);
    reload();
  };

  return (
    <Card className="w-100">
      <Card.Header>
        <h3>Project Groups</h3>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col>
            <h4>Administrator</h4>
            <GroupsEdit
              disabled={updating}
              groups={updatedAdminGroups || adminGroups}
              onChange={handleAdminGroupsChange}
            />
          </Col>
          <Col>
            <h4>Annotator</h4>
            <GroupsEdit
              disabled={updating}
              groups={updatedAnnotatorGroups || annotatorGroups}
              onChange={handleAnnotatorGroupsChange}
            />
          </Col>
        </Row>
      </Card.Body>
      <Card.Footer>
        <Nav className="justify-content-between">
          <Nav.Item>
            <Button
              variant="success"
              onClick={handleSave}
              disabled={!hasChanged}
            >
              Save
            </Button>{" "}
            <Button
              variant="outline-secondary"
              onClick={handleCancel}
              disabled={!hasChanged}
            >
              Cancel
            </Button>
          </Nav.Item>
        </Nav>
      </Card.Footer>
    </Card>
  );
}

export default AdminProjectGroups;
