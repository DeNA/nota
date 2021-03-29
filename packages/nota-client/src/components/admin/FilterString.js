import React from "react";
import { Form } from "react-bootstrap";

export const FilterString = function({ name, value, onChange }) {
  return (
    <Form.Control
      type="text"
      value={value || ""}
      onChange={evt => onChange(name, evt.target.value)}
    />
  );
};
