import {
  Position2D,
  RectangleAnnotation,
  RectangleNewAnnotation
} from "./common";
import ElementCreate from "./element-create";
import ImageAnnotation from "./index";
import { getNode } from "./util";

class RectCreate extends ElementCreate<RectangleNewAnnotation> {
  rect: SVGRectElement = null;
  startPoint: Position2D = null;
  movingPoint: Position2D = null;
  verticalGuide: SVGLineElement = null;
  horizontalGuide: SVGLineElement = null;
  labelBgDefs: SVGDefsElement = null;
  labelBg: SVGElement = null;
  label: SVGTextElement = null;
  label2: SVGTextElement = null;
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

    const rand = Math.random();
    this.labelBgDefs = getNode("defs") as SVGDefsElement;
    const labelBgFilter = getNode("filter", {
      x: "-0.02",
      y: "0",
      width: "1.04",
      height: "1.1",
      id: `${rand}_textBackground`
    });
    this.labelBg = getNode("feFlood", {
      "flood-color": "rgba(200,200,200,1)"
    });
    labelBgFilter.appendChild(this.labelBg);
    labelBgFilter.appendChild(
      getNode("feComposite", {
        in: "SourceGraphic",
        operator: "xor"
      })
    );
    this.labelBgDefs.appendChild(labelBgFilter);
    this.label = getNode("text", {
      filter: `url(#${rand}_textBackground)`,
      "text-anchor": "left"
    }) as SVGTextElement;
    this.label2 = getNode("text", {
      "text-anchor": "left"
    }) as SVGTextElement;

    this.parent.elements.drawCanvas.style.cursor = "none";
    this.verticalGuide.style.cursor = "none";
    this.horizontalGuide.style.cursor = "none";
    this.verticalGuide.setAttribute("class", "creation-guide");
    this.horizontalGuide.setAttribute("class", "creation-guide");
    this.group.appendChild(this.verticalGuide);
    this.group.appendChild(this.horizontalGuide);
    this.group.appendChild(this.rect);
    this.group.appendChild(this.labelBgDefs);
    this.group.appendChild(this.label);
    this.group.appendChild(this.label2);
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
    const { startPoint, movingPoint } = this;
    const { minHeight = 0, minWidth = 0 } = this.annotation.properties;
    const x = Math.min(startPoint.x, movingPoint.x);
    const y = Math.min(startPoint.y, movingPoint.y);
    const width = Math.max(startPoint.x, movingPoint.x) - x;
    const height = Math.max(startPoint.y, movingPoint.y) - y;
    const isMinHeight = height >= minHeight;
    const isMinWidth = width >= minWidth;

    if (!isMinHeight || !isMinWidth) {
      return;
    }

    window.removeEventListener("mouseup", this.mouseUpHandler);
    window.removeEventListener("mousemove", this.mouseMoveHandler);

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
    const { style, minHeight = 0, minWidth = 0 } = this.annotation.properties;
    const { strokeColor, fillColor } = this.style;
    const { startPoint, movingPoint } = this;
    const scaleFactor = 1 / this.parent.status.scale;

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
    const isMinHeight = height >= minHeight;
    const isMinWidth = width >= minWidth;
    const className = !isMinHeight || !isMinWidth ? "not-min-size" : "";
    const labelWidth = Math.floor(width);
    const labelHeight = Math.floor(height);
    const labelTotal = labelWidth * labelHeight;
    const sizeLabel = `${labelWidth}x${labelHeight} (${labelTotal})`;

    this.rect.setAttribute("class", className);
    this.rect.setAttributeNS(null, "x", x.toString());
    this.rect.setAttributeNS(null, "y", y.toString());
    this.rect.setAttributeNS(null, "width", width.toString());
    this.rect.setAttributeNS(null, "height", height.toString());
    this.rect.setAttributeNS(null, "stroke", style.strokeColor || strokeColor);
    this.rect.setAttributeNS(null, "fill", style.fillColor || fillColor);

    this.labelBg.setAttributeNS(
      null,
      "flood-color",
      style.strokeColor || strokeColor
    );
    this.label.textContent = sizeLabel;
    this.label.setAttributeNS(null, "x", (x + 0 * scaleFactor).toString());
    this.label.setAttributeNS(null, "y", (y - 3 * scaleFactor).toString());
    this.label.setAttributeNS(null, "font-size", `${scaleFactor}em`);
    this.label.setAttributeNS(null, "fill", style.strokeColor || strokeColor);
    this.label2.textContent = sizeLabel;
    this.label2.setAttributeNS(null, "x", (x + 0 * scaleFactor).toString());
    this.label2.setAttributeNS(null, "y", (y - 3 * scaleFactor).toString());
    this.label2.setAttributeNS(null, "font-size", `${scaleFactor}em`);
    this.label2.setAttributeNS(null, "fill", "rgb(0,0,0)");

    this.group.setAttribute("class", "label-always");
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
