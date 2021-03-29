import { getNode } from "./util";
import {
  Position2D,
  Style
} from "./common";

class PointCreateElement {
  group: SVGGElement = null;
  point: SVGCircleElement = null;
  horizontalGuide: SVGLineElement = null;
  verticalGuide: SVGLineElement = null;
  pointStroke: SVGCircleElement = null;
  handler: SVGCircleElement = null;
  constructor() {
    this.group = getNode("g") as SVGGElement;
    this.renderDomElement();
  }
  renderDomElement() {
    this.point = getNode("circle", {
      fill: "rgba(0,0,0,0)",
      "stroke-width": "2",
      "vector-effect": "non-scaling-stroke"
    }) as SVGCircleElement;
    this.horizontalGuide = getNode("line", {
      "stroke-width": "1",
      "vector-effect": "non-scaling-stroke",
      stroke: "rgba(255,255,0,0.8)"
    }) as SVGLineElement;
    this.verticalGuide = getNode("line", {
      "stroke-width": "1",
      "vector-effect": "non-scaling-stroke",
      stroke: "rgba(255,255,0,0.8)"
    }) as SVGLineElement;
    this.pointStroke = getNode("circle", {
      fill: "rgba(0,0,0,0)",
      "stroke-width": "3",
      "vector-effect": "non-scaling-stroke",
      stroke: "rgba(0,0,0,0.9)"
    }) as SVGCircleElement;
    this.handler = getNode("circle", {
      fill: "rgba(0,0,0,0.0001)",
      cursor: "none"
    }) as SVGCircleElement;

    this.verticalGuide.setAttribute("class", "point-creation-guide");
    this.horizontalGuide.setAttribute("class", "point-creation-guide");
    this.group.appendChild(this.horizontalGuide);
    this.group.appendChild(this.verticalGuide);
    this.group.appendChild(this.pointStroke);
    this.group.appendChild(this.point);
    this.group.appendChild(this.handler);
  }
  update(position: Position2D, style: Style, scale: number, maxScale: number) {
    const { x, y } = position;
    const { strokeColor } = style;
    const r = (1 / scale) * maxScale * 2.5;

    this.handler.setAttributeNS(null, "cx", x.toString());
    this.handler.setAttributeNS(null, "cy", y.toString());
    this.handler.setAttributeNS(null, "r", (r + 10).toString());
    this.pointStroke.setAttributeNS(null, "cx", x.toString());
    this.pointStroke.setAttributeNS(null, "cy", y.toString());
    this.pointStroke.setAttributeNS(null, "r", r.toString());
    this.point.setAttributeNS(null, "cx", x.toString());
    this.point.setAttributeNS(null, "cy", y.toString());
    this.point.setAttributeNS(null, "stroke", style.strokeColor || strokeColor);
    this.point.setAttributeNS(null, "r", r.toString());
    this.horizontalGuide.setAttributeNS(null, "x1", (x - r).toString());
    this.horizontalGuide.setAttributeNS(null, "x2", (x + r).toString());
    this.horizontalGuide.setAttributeNS(null, "y1", y.toString());
    this.horizontalGuide.setAttributeNS(null, "y2", y.toString());
    this.verticalGuide.setAttributeNS(null, "x1", x.toString());
    this.verticalGuide.setAttributeNS(null, "x2", x.toString());
    this.verticalGuide.setAttributeNS(null, "y1", (y - r).toString());
    this.verticalGuide.setAttributeNS(null, "y2", (y + r).toString());
  }
}

export default PointCreateElement;
