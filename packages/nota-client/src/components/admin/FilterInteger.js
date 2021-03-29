import React from "react";
import { Form, Row, Col } from "react-bootstrap";
import Icon from "../Icon";

export const FilterInteger = function({
  name,
  value: [lower, higher] = [undefined, undefined],
  onChange
}) {
  const handleChangeLower = function(evt) {
    const parsed = parseInt(evt.target.value);
    if (!isNaN(parsed)) {
      onChange(name, [parsed, higher]);
    } else if (evt.target.value === "") {
      onChange(name, [undefined, higher]);
    }
  };
  const handleChangeHigher = function(evt) {
    const parsed = parseInt(evt.target.value);
    if (!isNaN(parsed)) {
      onChange(name, [lower, parsed]);
    } else if (evt.target.value === "") {
      onChange(name, [lower, undefined]);
    }
  };

  return (
    <Row>
      <Col sm={5}>
        <Form.Control
          type="text"
          value={lower || lower === 0 ? lower : ""}
          onChange={handleChangeLower}
        />
      </Col>
      <Col sm={2} className="text-center">
        <Icon name="minus" />
      </Col>
      <Col sm={5}>
        <Form.Control
          type="text"
          value={higher || higher === 0 ? higher : ""}
          onChange={handleChangeHigher}
        />
      </Col>
    </Row>
  );
};
