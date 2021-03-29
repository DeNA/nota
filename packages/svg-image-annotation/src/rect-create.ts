import { getNode } from "./util";
import ElementCreate from "./element-create";
import ImageAnnotation from "./index";
import {
  Position2D,
  RectangleAnnotation,
  RectangleNewAnnotation,
  NewAnnotation
} from "./common";

class RectCreate extends ElementCreate<RectangleNewAnnotation> {
  rect: SVGRectElement = null;
  startPoint: Position2D = null;
  movingPoint: Position2D = null;
  verticalGuide: SVGLineElement = null;
  horizontalGuide: SVGLineElement = null;
  constructor(
    annotation: RectangleNewAnnotation,
    parent: ImageAnnotation,
    canvas: SVGRectElement
  ) {
    super(annotation, parent, canvas);

    window.addEventListener("mousemove", this.mouseMoveHandler);
    this.movingPoint = { x: -Infinity, y: Infinity };

    this.renderDomElement();
  }
  renderDomElement() {
    this.rect = getNode("rect", {
      "stroke-width": "2",
      "vector-effect": "non-scaling-stroke"
    }) as SVGRectElement;
    this.verticalGuide = getNode("line", {
      "stroke-width": "1",
      "vector-effect": "non-scaling-stroke"
    }) as SVGLineElement;
    this.horizontalGuide = getNode("line", {
      "stroke-width": "1",
      "vector-effect": "non-scaling-stroke"
    }) as SVGLineElement;

    this.parent.elements.drawCanvas.style.cursor = "none";
    this.verticalGuide.style.cursor = "none";
    this.horizontalGuide.style.cursor = "none";
    this.verticalGuide.setAttribute("class", "creation-guide");
    this.horizontalGuide.setAttribute("class", "creation-guide");
    this.group.appendChild(this.verticalGuide);
    this.group.appendChild(this.horizontalGuide);
    this.group.appendChild(this.rect);
    this.verticalGuide.addEventListener("mousedown", this.mouseDownHandler);
    this.horizontalGuide.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
  }
  mouseMoveHandler = (evt: MouseEvent) => {
    evt.stopPropagation();
    evt.preventDefault();

    const position = this.parent._getImagePosition(evt);
    this.movingPoint.x = position.x;
    this.movingPoint.y = position.y;

    this._update();
  };
  mouseDownHandler = (evt: MouseEvent) => {
    if (evt.button !== 0) {
      return;
    }

    evt.stopPropagation();
    evt.preventDefault();

    const { x, y } = this.parent._getImagePosition(evt);
    this.startPoint = { x, y };
    this.movingPoint = { x, y };

    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    window.addEventListener("mouseup", this.mouseUpHandler);

    this._update();
  };
  mouseUpHandler = (evt: MouseEvent) => {
    window.removeEventListener("mouseup", this.mouseUpHandler);
    window.removeEventListener("mousemove", this.mouseMoveHandler);

    const { startPoint, movingPoint } = this;
    const x = Math.min(startPoint.x, movingPoint.x);
    const y = Math.min(startPoint.y, movingPoint.y);
    const width = Math.max(startPoint.x, movingPoint.x) - x;
    const height = Math.max(startPoint.y, movingPoint.y) - y;

    const properties = {
      ...this.annotation.properties,
      x,
      y,
      width,
      height
    };
    const created: RectangleAnnotation = { ...this.annotation, properties };

    this.startPoint = null;
    this.movingPoint = null;
    this.parent._annotationCreated(created);
  };
  _update() {
    const { style } = this.annotation.properties;
    const { strokeColor, fillColor } = this.style;
    const { startPoint, movingPoint } = this;

    this.verticalGuide.setAttributeNS(
      null,
      "x1",
      this.movingPoint.x.toString()
    );
    this.verticalGuide.setAttributeNS(null, "y1", "0");
    this.verticalGuide.setAttributeNS(
      null,
      "x2",
      this.movingPoint.x.toString()
    );
    this.verticalGuide.setAttributeNS(
      null,
      "y2",
      this.canvas.getAttributeNS(null, "height")
    );
    this.verticalGuide.setAttributeNS(
      null,
      "stroke",
      style.strokeColor || strokeColor
    );
    this.horizontalGuide.setAttributeNS(null, "x1", "0");
    this.horizontalGuide.setAttributeNS(
      null,
      "y1",
      this.movingPoint.y.toString()
    );
    this.horizontalGuide.setAttributeNS(
      null,
      "x2",
      this.canvas.getAttributeNS(null, "width")
    );
    this.horizontalGuide.setAttributeNS(
      null,
      "y2",
      this.movingPoint.y.toString()
    );
    this.horizontalGuide.setAttributeNS(
      null,
      "stroke",
      style.strokeColor || strokeColor
    );
    if (!startPoint) {
      return;
    }

    const x = Math.min(startPoint.x, movingPoint.x);
    const y = Math.min(startPoint.y, movingPoint.y);
    const width = Math.max(startPoint.x, movingPoint.x) - x;
    const height = Math.max(startPoint.y, movingPoint.y) - y;

    this.rect.setAttributeNS(null, "x", x.toString());
    this.rect.setAttributeNS(null, "y", y.toString());
    this.rect.setAttributeNS(null, "width", width.toString());
    this.rect.setAttributeNS(null, "height", height.toString());
    this.rect.setAttributeNS(null, "stroke", style.strokeColor || strokeColor);
    this.rect.setAttributeNS(null, "fill", style.fillColor || fillColor);
  }
  destroy() {
    this.verticalGuide.removeEventListener("mousedown", this.mouseDownHandler);
    this.horizontalGuide.removeEventListener(
      "mousedown",
      this.mouseDownHandler
    );
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    window.removeEventListener("mouseup", this.mouseUpHandler);
    window.removeEventListener("mousemove", this.mouseMoveHandler);
    this.parent.elements.drawCanvas.style.cursor = "crosshair";
  }
}

export default RectCreate;
