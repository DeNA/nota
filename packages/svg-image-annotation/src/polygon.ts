import { PolygonAnnotation, Position2D } from "./common";
import Element from "./element";
import ImageAnnotation from "./index";
import { getNode } from "./util";

type Point = {
  view: SVGCircleElement;
  handler: SVGCircleElement;
  moving?: Position2D;
};

class Polygon extends Element<PolygonAnnotation> {
  polygon: SVGPolygonElement = null;
  pointsGroup: SVGGElement = null;
  linesGroup: SVGGElement = null;
  points: Point[] = [];
  lines: { line: SVGLineElement; start: Point; end: Point }[] = [];
  labelBgDefs: SVGDefsElement = null;
  labelBg: SVGElement = null;
  label: SVGTextElement = null;
  label2: SVGTextElement = null;
  selectable: SVGPolygonElement = null;
  constructor(parent: ImageAnnotation) {
    super(parent);

    this.renderDomElement();
  }
  handlePointRemove(evt: MouseEvent) {
    if (evt.button !== 0 || !evt.shiftKey) {
      return;
    }

    const pointIndex = this.points.findIndex(
      point => point.handler === evt.target
    );
    if (pointIndex === -1) {
      return;
    }

    if (this.points.length <= 3) {
      return;
    }

    evt.stopPropagation();
    evt.preventDefault();

    const points = this.getPoints();
    points.splice(pointIndex, 1);
    const properties = {
      ...this.annotation.properties,
      points
    };
    const changed: PolygonAnnotation = { ...this.annotation, properties };

    this.parent._annotationChanged(changed);
  }
  handlePointAdd(evt: MouseEvent) {
    if (evt.button !== 0 || !evt.altKey) {
      return;
    }

    const line = this.lines.find(line => line.line === evt.target);
    if (!line) {
      return;
    }
    const index = this.points.indexOf(line.start);
    if (index === -1) {
      return;
    }

    evt.stopPropagation();
    evt.preventDefault();

    const position = this.parent._getImagePosition(evt);

    const points = this.getPoints();
    points.splice(index + 1, 0, { x: position.x, y: position.y });
    const properties = {
      ...this.annotation.properties,
      points
    };
    const changed = { ...this.annotation, properties };

    this.parent._annotationChanged(changed);
  }
  handleDrag(evt: MouseEvent) {
    if (evt.button !== 0 || evt.shiftKey) {
      return;
    }

    const point = this.points.find(point => point.handler === evt.target);
    if (!point) {
      return;
    }

    evt.stopPropagation();
    evt.preventDefault();

    const mouseMoveHandler = (evt: MouseEvent) => {
      evt.stopPropagation();
      evt.preventDefault();

      const { x, y } = this.parent._getImagePosition(evt);
      point.moving = { x, y };
      this.update();
    };

    const mouseUpHandler = (evt: MouseEvent) => {
      evt.stopPropagation();
      evt.preventDefault();
      window.removeEventListener("mousemove", mouseMoveHandler);
      window.removeEventListener("mouseup", mouseUpHandler);

      const properties = {
        ...this.annotation.properties,
        points: this.getPoints()
      };
      const changed = { ...this.annotation, properties };

      delete point.moving;
      this.parent._annotationChanged(changed);
    };

    window.addEventListener("mousemove", mouseMoveHandler);
    window.addEventListener("mouseup", mouseUpHandler);
  }
  renderDomElement() {
    this.polygon = getNode("polygon", {
      "vector-effect": "non-scaling-stroke"
    }) as SVGPolygonElement;
    this.pointsGroup = getNode("g") as SVGGElement;
    this.linesGroup = getNode("g") as SVGGElement;

    this.pointsGroup.onmousedown = (evt: MouseEvent) => this.handleDrag(evt);
    this.pointsGroup.onclick = (evt: MouseEvent) => this.handlePointRemove(evt);
    this.linesGroup.onclick = (evt: MouseEvent) => this.handlePointAdd(evt);

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
      "text-anchor": "end"
    }) as SVGTextElement;
    this.label2 = getNode("text", {
      "text-anchor": "end"
    }) as SVGTextElement;

    this.selectable = getNode("polygon", {
      "stroke-width": "0"
    }) as SVGPolygonElement;
    this.selectable.setAttribute("class", "selectable-item");

    this.selectable.onclick = (evt: MouseEvent) => this.handleSelect(evt);
  }
  handleSelect(evt: MouseEvent) {
    if (evt.button !== 0) {
      return;
    }

    evt.stopPropagation();
    evt.preventDefault();

    this.parent._annotationSelected(this.annotation);
  }
  annotationWasSet() {
    const { points } = this.annotation.properties;

    while (this.pointsGroup.firstChild) {
      this.pointsGroup.removeChild(this.pointsGroup.firstChild);
    }
    while (this.linesGroup.firstChild) {
      this.linesGroup.removeChild(this.linesGroup.firstChild);
    }

    this.points = points.map(point => {
      const view = getNode("circle", {
        r: "1",
        cx: point.x.toString(),
        cy: point.y.toString(),
        fill: "none",
        "stroke-width": "5",
        "vector-effect": "non-scaling-stroke"
      }) as SVGCircleElement;
      const handler = getNode("circle", {
        r: "2",
        cx: point.x.toString(),
        cy: point.y.toString(),
        stroke: "rgba(0,0,0,0.0001)",
        fill: "rgba(0,0,0,0.0001)",
        "vector-effect": "non-scaling-stroke"
      }) as SVGCircleElement;

      handler.setAttribute("class", "polygon-point");

      this.pointsGroup.appendChild(view);
      this.pointsGroup.appendChild(handler);

      return { view, handler };
    });

    for (let i = 0; i < this.points.length; i++) {
      const start = this.points[i];
      const end = this.points[i + 1] || this.points[0];
      const line = getNode("line", {
        x1: start.handler.getAttributeNS(null, "cx"),
        y1: start.handler.getAttributeNS(null, "cy"),
        x2: end.handler.getAttributeNS(null, "cx"),
        y2: end.handler.getAttributeNS(null, "cy"),
        "stroke-width": "10",
        stroke: "rgba(0,0,0,0.0001)",
        fill: "rgba(0,0,0,0.0001)",
        "vector-effect": "non-scaling-stroke"
      }) as SVGLineElement;

      line.setAttribute("class", "polygon-line");

      this.linesGroup.appendChild(line);
      this.lines.push({
        line,
        start,
        end
      });
    }
  }
  getPoints() {
    return this.points.map(point => {
      if (point.moving) {
        return point.moving;
      } else {
        return {
          x: parseFloat(point.handler.getAttributeNS(null, "cx")),
          y: parseFloat(point.handler.getAttributeNS(null, "cy"))
        };
      }
    });
  }
  isMoving() {
    return !!this.points.find(point => !!point.moving);
  }
  addBaseElements() {
    this.group.appendChild(this.labelBgDefs);
    this.group.appendChild(this.label);
    this.group.appendChild(this.label2);
    this.group.appendChild(this.polygon);
  }
  addEditableElements() {
    this.group.appendChild(this.linesGroup);
    this.group.appendChild(this.pointsGroup);
  }
  addSelectableElements() {
    this.group.appendChild(this.selectable);
  }
  update() {
    const { editable, label, selectable } = this.annotation;
    const { style = {} } = this.annotation.properties;
    const { strokeColor, fillColor } = this.style;
    const scaleFactor = 1 / this.parent.status.scale;
    const strokeWidth = this.selected
      ? this.parent.options.selectedAnnotationStrokeWidth
      : this.parent.options.strokeWidth;

    const points = this.getPoints();
    const pointsString = points.map(point => `${point.x},${point.y}`).join(" ");

    this.emptyContainer();

    this.polygon.setAttributeNS(null, "points", pointsString);
    this.polygon.setAttributeNS(null, "fill", style.fillColor || fillColor);
    this.polygon.setAttributeNS(null, "stroke-width", strokeWidth.toString());
    this.polygon.setAttributeNS(
      null,
      "stroke",
      style.strokeColor || strokeColor
    );

    this.selectable.setAttributeNS(null, "points", pointsString);

    points.forEach((point, index) => {
      const current = this.points[index];
      const { x, y } = point;

      current.view.setAttributeNS(null, "cx", x.toString());
      current.view.setAttributeNS(null, "cy", y.toString());
      current.view.setAttributeNS(
        null,
        "stroke",
        style.strokeColor || strokeColor
      );
      current.handler.setAttributeNS(null, "cx", x.toString());
      current.handler.setAttributeNS(null, "cy", y.toString());
    });

    this.lines.forEach(line => {
      line.line.setAttributeNS(
        null,
        "x1",
        line.start.handler.getAttributeNS(null, "cx")
      );
      line.line.setAttributeNS(
        null,
        "y1",
        line.start.handler.getAttributeNS(null, "cy")
      );
      line.line.setAttributeNS(
        null,
        "x2",
        line.end.handler.getAttributeNS(null, "cx")
      );
      line.line.setAttributeNS(
        null,
        "y2",
        line.end.handler.getAttributeNS(null, "cy")
      );
    });

    this.labelBg.setAttributeNS(
      null,
      "flood-color",
      style.strokeColor || strokeColor
    );
    this.label.textContent = label || "";
    this.label.setAttributeNS(
      null,
      "x",
      (points[0].x + 0 * scaleFactor).toString()
    );
    this.label.setAttributeNS(
      null,
      "y",
      (points[0].y - 3 * scaleFactor).toString()
    );
    this.label.setAttributeNS(null, "font-size", `${scaleFactor * 1.1}em`);
    this.label.setAttributeNS(null, "fill", style.strokeColor || strokeColor);
    this.label2.textContent = label || "";
    this.label2.setAttributeNS(
      null,
      "x",
      (points[0].x + 0 * scaleFactor).toString()
    );
    this.label2.setAttributeNS(
      null,
      "y",
      (points[0].y - 3 * scaleFactor).toString()
    );
    this.label2.setAttributeNS(null, "font-size", `${scaleFactor * 1.1}em`);
    this.label2.setAttributeNS(null, "fill", "rgb(0,0,0)");

    let className = "";
    if (this.parent.options.showLabels === "always") {
      className += " label-always";
    }
    if (this.parent.options.showLabels === "hover") {
      className += " label-hover";
    }
    if (selectable && !this.selected) {
      className += " selectable";
    }
    if (this.selected) {
      className += " selected";
    }
    if (this.isMoving()) {
      className += " moving";
    }
    this.group.setAttribute("class", className);

    this.addBaseElements();

    if ((editable && this.selected) || (editable && !selectable)) {
      this.addEditableElements();
    }

    if (selectable && !this.selected) {
      this.addSelectableElements();
    }
  }
}

export default Polygon;
