import React, { Component } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./semantic";
import "./FullscreenPopup.css";

/**
 * @augments {Component<{
      close: () => any,
      contents: any
    },{}>} 
 */
class FullscreenPopup extends Component {
  container = null;
  constructor(props) {
    super(props);

    this.container = document.createElement("div");
    this.container.className = "fullscreen-popup";
  }
  componentDidMount() {
    document.getElementsByTagName("body")[0].appendChild(this.container);
  }
  componentWillUnmount() {
    document.getElementsByTagName("body")[0].removeChild(this.container);
  }
  handleContainerClick = evt => {
    evt.stopPropagation();
  };
  render() {
    const { contents, close } = this.props;

    const popup = (
      <div className="container" onClick={close}>
        <div className="header">
          <Icon
            className="close-button"
            name="close"
            size="big"
            title={`Close (o)`}
            onClick={close}
          />
        </div>
        <div className="contents" onClick={this.handleContainerClick}>
          {contents || ""}
        </div>
        <div className="footer" />
      </div>
    );

    return createPortal(popup, this.container);
  }
}

export default FullscreenPopup;
