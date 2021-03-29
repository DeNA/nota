import React from "react";
import { Row, Col, Form } from "react-bootstrap";
import { FilterString } from "./FilterString";
import { MediaItemTag } from "../../lib/models";
import { FilterInteger } from "./FilterInteger";
import { FilterDatetime } from "./FilterDatetime";

export const Filters = function({
  filters = [],
  filterConditions = {},
  setFilterConditions
}) {
  const handleChangeFilterConditions = function(name, value) {
    setFilterConditions({ ...filterConditions, [name]: value });
  };

  return (
    <>
      {filters.map(filter => (
        <Form.Group as={Row} key={filter.name}>
          <Form.Label column sm={2}>
            {filter.label}
          </Form.Label>
          <Col sm={10}>
            {filter.type === MediaItemTag.TYPE.STRING && (
              <FilterString
                name={filter.name}
                value={filterConditions[filter.name]}
                onChange={handleChangeFilterConditions}
              />
            )}
            {filter.type === MediaItemTag.TYPE.INTEGER && (
              <FilterInteger
                name={filter.name}
                value={filterConditions[filter.name]}
                onChange={handleChangeFilterConditions}
              />
            )}
            {filter.type === MediaItemTag.TYPE.DATETIME && (
              <FilterDatetime
                name={filter.name}
                value={filterConditions[filter.name]}
                onChange={handleChangeFilterConditions}
              />
            )}
          </Col>
        </Form.Group>
      ))}
    </>
  );
};
