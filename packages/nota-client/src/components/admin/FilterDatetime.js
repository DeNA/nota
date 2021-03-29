import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Row, Col } from "react-bootstrap";
import Icon from "../Icon";

const parseDate = function(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date
    .getDate()
    .toString()
    .padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const FilterDatetime = function({
  name,
  value: [lower, higher] = [undefined, undefined],
  onChange
}) {
  const handleChangeLower = function(date) {
    const parsed = date ? parseDate(date) : undefined;
    onChange(name, [parsed, higher]);
  };
  const handleChangeHigher = function(date) {
    const parsed = date ? parseDate(date) : undefined;
    onChange(name, [lower, parsed]);
  };

  const lowerDate = lower ? new Date(lower) : null;
  const higherDate = higher ? new Date(higher) : null;

  return (
    <Row>
      <Col sm={5}>
        <DatePicker
          onChange={handleChangeLower}
          selected={lowerDate}
          dateFormat="yyyy-MM-dd"
        />
      </Col>
      <Col sm={2} className="text-center">
        <Icon name="minus" />
      </Col>
      <Col sm={5}>
        <DatePicker
          onChange={handleChangeHigher}
          selected={higherDate}
          dateFormat="yyyy-MM-dd"
        />
      </Col>
    </Row>
  );
};
