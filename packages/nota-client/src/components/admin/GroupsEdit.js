import React from "react";
import { Form, Button, InputGroup } from "react-bootstrap";

const GroupsEdit = function({ groups, onChange, disabled = false }) {
  const handleUserGroupsChange = function(evt, i) {
    const updatedGroups = [...groups];

    updatedGroups[i] = evt.target.value;
    onChange(updatedGroups);
  };

  const handleUserGroupsAdd = function() {
    const updatedGroups = [...groups];

    updatedGroups.push("");
    onChange(updatedGroups);
  };

  const handleUserGroupsDelete = function(i) {
    const updatedGroups = [...groups];

    updatedGroups.splice(i, 1);
    onChange(updatedGroups);
  };

  return (
    <>
      {groups.map((group, i) => (
        <InputGroup key={i} className="mt-1" size="sm">
          <Form.Control
            type="text"
            disabled={disabled}
            value={group}
            onChange={evt => handleUserGroupsChange(evt, i)}
          />
          <InputGroup.Append>
            <Button
              disabled={disabled}
              variant="outline-secondary"
              onClick={() => handleUserGroupsDelete(i)}
            >
              X
            </Button>
          </InputGroup.Append>
        </InputGroup>
      ))}
      <Button
        size="sm"
        disabled={disabled}
        variant="outline-success"
        className="mt-1"
        onClick={handleUserGroupsAdd}
      >
        +
      </Button>
    </>
  );
};

export default GroupsEdit;
