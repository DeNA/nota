import React, { Component } from "react";

/**
 * @augments {Component<{
      box: object,
      active: boolean,
      editable: boolean,
      scale: number,
      lineWidth: number,
      dragLineWidth: number,
      relativePosition: function,
      resize: function,
      selectAnnotation: function
    }, {}>}
 */
class SVGBox extends Component {
  constructor(props) {
    const { box } = props;
    super(props);
    this.state = { ...box };
  }
  componentWillReceiveProps(nextProps) {
    const { box } = nextProps;

    if (JSON.stringify(this.props.box) !== JSON.stringify(box)) {
      this.setState({ ...box });
    }
  }
  onMouseDown(evt, anchor = "se") {
    const { active, editable } = this.props;
    if (!active || !editable || evt.button !== 0) {
      return;
    }
    evt.stopPropagation();
    evt.preventDefault();

    const mouseMoveHandler = evt => {
      evt.stopPropagation();
      evt.preventDefault();
      this.onMouseMove(evt, anchor);
    };
    const mouseUpHandler = evt => {
      evt.stopPropagation();
      evt.preventDefault();
      window.removeEventListener("mousemove", mouseMoveHandler);
      window.removeEventListener("mouseup", mouseUpHandler);
      this.onMouseUp();
    };

    window.addEventListener("mousemove", mouseMoveHandler);
    window.addEventListener("mouseup", mouseUpHandler);
  }
  calculateNewBox(position, anchor) {
    const { x, y, width, height } = this.state;
    const { box } = this.props;
    let newBox = { x, y, width, height };

    if (anchor.includes("w")) {
      newBox.x = Math.min(position.x, box.x + box.width);
      newBox.width = Math.max(position.x, box.x + box.width) - newBox.x;
    }

    if (anchor.includes("n")) {
      newBox.y = Math.min(position.y, box.y + box.height);
      newBox.height = Math.max(position.y, box.y + box.height) - newBox.y;
    }

    if (anchor.includes("e")) {
      newBox.x = Math.min(position.x, box.x);
      newBox.width = Math.max(position.x, box.x) - newBox.x;
    }

    if (anchor.includes("s")) {
      newBox.y = Math.min(position.y, box.y);
      newBox.height = Math.max(position.y, box.y) - newBox.y;
    }

    return newBox;
  }
  onMouseMove({ clientX, clientY }, anchor) {
    const { relativePosition } = this.props;
    const position = relativePosition(clientX, clientY);

    this.setState(this.calculateNewBox(position, anchor));
  }
  onMouseUp() {
    const { resize } = this.props;
    const { x, y, width, height } = this.state;
    let box = { x, y, width, height };
    resize(box);
  }
  onClick(evt) {
    const { selectAnnotation } = this.props;
    evt.stopPropagation();
    evt.preventDefault();
    selectAnnotation();
  }
  render() {
    const { active, editable, scale, dragLineWidth } = this.props;
    const lineWidth = active ? this.props.lineWidth : 1;
    const { x, y, width, height } = this.state;
    const margin = active ? lineWidth / 2 / scale : 0;
    return (
      <g className={`${active ? "active" : ""} ${editable ? "editable" : ""}`}>
        <rect
          className="box"
          {...{ x, y, width, height }}
          onClick={evt => this.onClick(evt)}
        />
        <line
          className="line w"
          x1={x - margin}
          y1={y - margin}
          x2={x - margin}
          y2={y + height + margin}
          vectorEffect="non-scaling-stroke"
          strokeWidth={lineWidth}
        />
        <line
          className="line e"
          x1={x + width + margin}
          y1={y - margin}
          x2={x + width + margin}
          y2={y + height + margin}
          vectorEffect="non-scaling-stroke"
          strokeWidth={lineWidth}
        />
        <line
          className="line n"
          x1={x - margin}
          y1={y - margin}
          x2={x + width + margin}
          y2={y - margin}
          vectorEffect="non-scaling-stroke"
          strokeWidth={lineWidth}
        />
        <line
          className="line s"
          x1={x - margin}
          y1={y + height + margin}
          x2={x + width + margin}
          y2={y + height + margin}
          vectorEffect="non-scaling-stroke"
          strokeWidth={lineWidth}
        />
        <line
          className="corner nw"
          x1={x - margin}
          y1={y - margin}
          x2={x - margin}
          y2={y - margin}
          vectorEffect="non-scaling-stroke"
          strokeWidth={lineWidth * 1.2}
        />
        <line
          className="corner ne"
          x1={x + width + margin}
          y1={y - margin}
          x2={x + width + margin}
          y2={y - margin}
          vectorEffect="non-scaling-stroke"
          strokeWidth={lineWidth * 1.2}
        />
        <line
          className="corner sw"
          x1={x - margin}
          y1={y + height + margin}
          x2={x - margin}
          y2={y + height + margin}
          vectorEffect="non-scaling-stroke"
          strokeWidth={lineWidth * 1.2}
        />
        <line
          className="corner se"
          x1={x + width + margin}
          y1={y + height + margin}
          x2={x + width + margin}
          y2={y + height + margin}
          vectorEffect="non-scaling-stroke"
          strokeWidth={lineWidth * 1.2}
        />
        <line
          className="dragLine w"
          x1={x}
          y1={y}
          x2={x}
          y2={y + height}
          vectorEffect="non-scaling-stroke"
          strokeWidth={dragLineWidth}
          onMouseDown={evt => this.onMouseDown(evt, "w")}
        />
        <line
          className="dragLine e"
          x1={x + width}
          y1={y}
          x2={x + width}
          y2={y + height}
          vectorEffect="non-scaling-stroke"
          strokeWidth={dragLineWidth}
          onMouseDown={evt => this.onMouseDown(evt, "e")}
        />
        <line
          className="dragLine n"
          x1={x}
          y1={y}
          x2={x + width}
          y2={y}
          vectorEffect="non-scaling-stroke"
          strokeWidth={dragLineWidth}
          onMouseDown={evt => this.onMouseDown(evt, "n")}
        />
        <line
          className="dragLine s"
          x1={x}
          y1={y + height}
          x2={x + width}
          y2={y + height}
          vectorEffect="non-scaling-stroke"
          strokeWidth={dragLineWidth}
          onMouseDown={evt => this.onMouseDown(evt, "s")}
        />
        <line
          className="dragCorner nw"
          x1={x}
          y1={y}
          x2={x}
          y2={y}
          vectorEffect="non-scaling-stroke"
          strokeWidth={dragLineWidth}
          onMouseDown={evt => this.onMouseDown(evt, "nw")}
        />
        <line
          className="dragCorner ne"
          x1={x + width}
          y1={y}
          x2={x + width}
          y2={y}
          vectorEffect="non-scaling-stroke"
          strokeWidth={dragLineWidth}
          onMouseDown={evt => this.onMouseDown(evt, "ne")}
        />
        <line
          className="dragCorner sw"
          x1={x}
          y1={y + height}
          x2={x}
          y2={y + height}
          vectorEffect="non-scaling-stroke"
          strokeWidth={dragLineWidth}
          onMouseDown={evt => this.onMouseDown(evt, "sw")}
        />
        <line
          className="dragCorner se"
          x1={x + width}
          y1={y + height}
          x2={x + width}
          y2={y + height}
          vectorEffect="non-scaling-stroke"
          strokeWidth={dragLineWidth}
          onMouseDown={evt => this.onMouseDown(evt, "se")}
        />
      </g>
    );
  }
}

export default SVGBox;
