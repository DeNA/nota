import { getNode } from "./util";
import ElementCreate from "./element-create";
import {
  Position2D,
  PolygonAnnotation,
  PolygonNewAnnotation,
  NewAnnotation
} from "./common";
import ImageAnnotation from "./index";

class PolygonCreate extends ElementCreate<PolygonNewAnnotation> {
  polygon: SVGPolylineElement = null;
  point: SVGCircleElement = null;
  handler: SVGCircleElement = null;
  points: Position2D[] = [];
  movingPoint: Position2D = null;
  constructor(
    annotation: PolygonNewAnnotation,
    parent: ImageAnnotation,
    canvas: SVGRectElement
  ) {
    super(annotation, parent, canvas);

    this.movingPoint = { x: 0, y: 0 };
    this.renderDomElement();
  }
  renderDomElement() {
    this.point = getNode("circle", {
      r: "1",
      "stroke-width": "5",
      "vector-effect": "non-scaling-stroke"
    }) as SVGCircleElement;
    this.handler = getNode("circle", {
      r: "10",
      stroke: "rgba(0,0,0,0.0001)",
      fill: "rgba(0,0,0,0.0001)",
      "vector-effect": "non-scaling-stroke"
    }) as SVGCircleElement;
    this.polygon = getNode("polyline", {
      "stroke-width": "3",
      "vector-effect": "non-scaling-stroke"
    }) as SVGPolylineElement;

    this.group.appendChild(this.polygon);
    this.group.appendChild(this.point);
    this.group.appendChild(this.handler);

    this.canvas.addEventListener("mouseup", this.mouseClickHandler);
    this.polygon.addEventListener("click", this.mouseClickHandler);
    this.handler.addEventListener("click", this.startPointClickHandler);
    window.addEventListener("mousemove", this.mouseMoveHandler);
    window.addEventListener("keyup", this.deletePointHandler);
  }
  deletePointHandler = (evt: KeyboardEvent) => {
    if (evt.key === "Backspace") {
      if (this.points.length) {
        evt.stopPropagation();
        evt.preventDefault();
        this.points.pop();
        this._update();
      }
    }
  };
  mouseMoveHandler = (evt: MouseEvent) => {
    evt.stopPropagation();
    evt.preventDefault();

    const position = this.parent._getImagePosition(evt);
    this.movingPoint.x = position.x;
    this.movingPoint.y = position.y;

    this._update();
  };
  startPointClickHandler = (evt: MouseEvent) => {
    if (evt.button !== 0) {
      return;
    }

    evt.stopPropagation();
    evt.preventDefault();

    if (this.points.length < 3) {
      return;
    }

    const properties = {
      ...this.annotation.properties,
      points: this.points
    };
    const created: PolygonAnnotation = { ...this.annotation, properties };

    this.parent._annotationCreated(created);
  };
  mouseClickHandler = (evt: MouseEvent) => {
    if (evt.button !== 0) {
      return;
    }

    const { x, y } = this.parent._getImagePosition(evt);
    this.points.push({ x, y });
  };
  _update() {
    const { style } = this.annotation.properties;
    const { strokeColor, fillColor } = this.style;
    const points = this.points.length
      ? this.points.concat([this.movingPoint])
      : [];
    const pointsString = points.map(point => `${point.x},${point.y}`).join(" ");

    this.polygon.setAttributeNS(null, "points", pointsString);
    this.polygon.setAttributeNS(null, "fill", style.fillColor || fillColor);
    this.polygon.setAttributeNS(
      null,
      "stroke",
      style.strokeColor || strokeColor
    );

    points[0]
      ? this.point.setAttributeNS(null, "cx", points[0].x.toString())
      : this.point.removeAttributeNS(null, "cx");
    points[0]
      ? this.point.setAttributeNS(null, "cy", points[0].y.toString())
      : this.point.removeAttributeNS(null, "cy");
    this.point.setAttributeNS(null, "stroke", style.strokeColor || strokeColor);
    this.point.setAttributeNS(null, "fill", style.strokeColor || strokeColor);

    points[0]
      ? this.handler.setAttributeNS(null, "cx", points[0].x.toString())
      : this.handler.removeAttributeNS(null, "cx");
    points[0]
      ? this.handler.setAttributeNS(null, "cy", points[0].y.toString())
      : this.handler.removeAttributeNS(null, "cy");
  }
  destroy() {
    this.canvas.removeEventListener("mouseup", this.mouseClickHandler);
    this.polygon.removeEventListener("click", this.mouseClickHandler);
    this.handler.removeEventListener("click", this.startPointClickHandler);
    window.removeEventListener("mousemove", this.mouseMoveHandler);
    window.removeEventListener("keyup", this.deletePointHandler);
  }
}

export default PolygonCreate;
