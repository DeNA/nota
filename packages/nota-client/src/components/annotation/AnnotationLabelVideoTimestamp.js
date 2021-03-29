import React, { useContext } from "react";
import {
  Button,
  Col,
  Container,
  FormControl,
  InputGroup,
  Row
} from "react-bootstrap";
import useHotkeys from "../../lib/useHotkeys";
import Icon from "../Icon";
import AnnotationLabel from "./AnnotationLabel";
import { videoControlsContext } from "./videoControls";

// {
//   "name": "timestamp",
//   "label": "Event start time",
//   "type": "VIDEO_TIMESTAMP",
//   "hotkey": "s",
//   "options": {
//     "required": true, // default false
//     "description": "Insert the frame number",
//     "autoPopulate": true // default false,
//     "manuallyEditable": true // default false
//   }
// }
/**
 * @param {{label: Nota.LabelVideoTimestamp, value?: number, editable: boolean, onChange: any}} props
 */
const AnnotationLabelVideoTimestamp = props => {
  const {
    videoControls: { getTime, setTime, getDuration }
  } = useContext(videoControlsContext);
  const { label, value, editable, onChange } = props;
  const hasValue = value !== undefined;

  const hotkeys = [];
  if (label.hotkey && editable) {
    hotkeys.push([
      label.hotkey,
      () => {
        onChange(getTime());
      }
    ]);
  }
  useHotkeys(hotkeys);

  const handleSetTime = function(evt) {
    evt.target.blur();
    onChange(getTime());
  };

  const handleClearTime = function(evt) {
    evt.target.blur();
    onChange();
  };

  const handleGoToTime = function(evt) {
    evt.target.blur();
    setTime(value);
  };

  const handleInputChange = function({ target }) {
    const parsed = parseInt(target.value);
    if (!isNaN(parsed)) {
      onChange(Math.min(getDuration(), Math.max(0, parsed)));
    }
  };

  const renderContents = () => {
    if (!editable) {
      return (
        <Container fluid>
          <Row>
            <Col
              md="auto"
              className="d-flex justify-content-start align-items-center"
            >
              <div className="time-value-read-only">
                {hasValue ? `${value} ms` : "--"}
              </div>
            </Col>
            <Col md="auto">
              <Button
                className="button-go-to-time"
                disabled={!hasValue}
                variant="outline-info"
                onClick={handleGoToTime}
              >
                <Icon name="eye" /> Jump
              </Button>
            </Col>
          </Row>
        </Container>
      );
    }
    return (
      <div>
        <div>{label.options.description}</div>
        <Container fluid>
          <Row>
            <Col md="auto" className="pl-0">
              <InputGroup>
                <InputGroup.Prepend>
                  <Button
                    className="button-set-time"
                    variant="success"
                    onClick={handleSetTime}
                  >
                    <Icon name="timer" /> Set
                    {label.hotkey ? ` (${label.hotkey})` : ""}
                  </Button>
                </InputGroup.Prepend>
                <FormControl
                  className="time-value-input"
                  type="text"
                  disabled={!label.options.manuallyEditable}
                  pattern="\d*"
                  onChange={handleInputChange}
                  value={hasValue ? value.toString() : ""}
                />
                <InputGroup.Append>
                  <InputGroup.Text>ms</InputGroup.Text>
                </InputGroup.Append>
              </InputGroup>
            </Col>
            <Col md="auto" className="p-0">
              <Button
                className="button-clear-time"
                variant="outline-secondary"
                onClick={handleClearTime}
              >
                <Icon name="delete" />
              </Button>
            </Col>
            <Col md="auto">
              <Button
                className="button-go-to-time"
                disabled={!hasValue}
                variant="outline-info"
                onClick={handleGoToTime}
              >
                <Icon name="eye" /> Jump
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
    );
  };

  return (
    <AnnotationLabel
      label={label.label}
      contents={renderContents()}
      required={label.options.required}
      hasValue={value !== undefined}
    />
  );
};

export default AnnotationLabelVideoTimestamp;
