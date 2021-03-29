import React from "react";
import {
  OPTION_FOCUS,
  OPTION_LABEL_SHOW_ALWAYS,
  OPTION_LABEL_SHOW_HOVER,
  OPTION_LABEL_SHOW_OFF,
  OPTION_NOOP,
  OPTION_POPUP_FOCUS
} from "../../constants";
import history from "../../lib/history";
import Icon from "../Icon";
import ImageFiltersContainer from "./containers/ImageFiltersContainer";
import { Dropdown } from "./semantic";

const ProjectMenu = ({
  project,
  task,
  options,
  changeOptions,
  closeTask,
  totalItems,
  completeItems
}) => {
  const { labelsShow = OPTION_LABEL_SHOW_HOVER } = options;
  const handleChangeLabelsShow = function() {
    let newLabelsShow;

    switch (labelsShow) {
      case OPTION_LABEL_SHOW_OFF:
        newLabelsShow = OPTION_LABEL_SHOW_HOVER;
        break;
      case OPTION_LABEL_SHOW_HOVER:
        newLabelsShow = OPTION_LABEL_SHOW_ALWAYS;
        break;
      case OPTION_LABEL_SHOW_ALWAYS:
        newLabelsShow = OPTION_LABEL_SHOW_OFF;
        break;
      default:
        return;
    }
    changeOptions({
      labelsShow: newLabelsShow
    });
  };

  const handleCloseTask = function() {
    closeTask();
    history.push("/");
  };

  return (
    <>
      <Dropdown className="main-menu" size="mini" icon="home" pointing="left">
        <Dropdown.Menu>
          <Dropdown.Header
            content={
              <div>
                <span>{project}</span>
                <br />
                <span>{task}</span>
                <br />
                <span>
                  Complete: {completeItems}/{totalItems}
                </span>
              </div>
            }
          />
          <Dropdown.Item onClick={handleCloseTask}>Close Task</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Header content="Image Filters" />
          <Dropdown.Item>
            <ImageFiltersContainer />
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Header content="Options" />
          <Dropdown.Item>
            <div>
              <Icon name="signal" /> Zoom sensibility:{" "}
              {options.zoomSensibility * 5}
            </div>
            <div>
              <input
                type="range"
                min={1}
                max={20}
                step={1}
                value={options.zoomSensibility * 5}
                onChange={evt => {
                  changeOptions({
                    zoomSensibility: parseInt(evt.target.value) / 5
                  });
                }}
              />
            </div>
          </Dropdown.Item>
          <Dropdown.Item>
            <div>
              <Icon name="zoom-out" /> Minimum zoom: {options.minScale}x
            </div>
            <div>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={options.minScale}
                onChange={evt => {
                  changeOptions({ minScale: evt.target.value });
                }}
              />
            </div>
          </Dropdown.Item>
          <Dropdown.Item>
            <div>
              <Icon name="zoom-in" /> Maximum zoom: {options.maxScale}x
            </div>
            <div>
              <input
                type="range"
                min={1}
                max={30}
                step={0.5}
                value={options.maxScale}
                onChange={evt => {
                  changeOptions({ maxScale: evt.target.value });
                }}
              />
            </div>
          </Dropdown.Item>
          <Dropdown.Item>
            <div>
              <Icon name="resize-both" /> Zoom in (ctrl+click):{" "}
              {options.maxScaleClick}x
            </div>
            <div>
              <input
                type="range"
                min={1}
                max={30}
                step={0.5}
                value={options.maxScaleClick}
                onChange={evt => {
                  changeOptions({ maxScaleClick: evt.target.value });
                }}
              />
            </div>
          </Dropdown.Item>
          <Dropdown.Item>
            After Creation:{" "}
            <Dropdown
              inline
              options={[
                { text: "Do Nothing", value: OPTION_NOOP },
                { text: "Select First Item", value: OPTION_FOCUS },
                {
                  text: "Popup and Select First Item",
                  value: OPTION_POPUP_FOCUS
                }
              ]}
              value={options.onCreate}
              onChange={(evt, data) => changeOptions({ onCreate: data.value })}
            />
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <div
        className={`labels-show ${labelsShow}`}
        title={`Show labels`}
        onClick={handleChangeLabelsShow}
      >
        <Icon name="tags" />
      </div>
    </>
  );
};

export default ProjectMenu;
