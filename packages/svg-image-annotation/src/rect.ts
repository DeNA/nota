import { RectangleAnnotation } from "./common";
import Element from "./element";
import ImageAnnotation from "./index";
import { getNode, isNullOrUndefined } from "./util";

type Anchor = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

class Rect extends Element<RectangleAnnotation> {
  rect: SVGRectElement = null;
  w: SVGLineElement = null;
  e: SVGLineElement = null;
  n: SVGLineElement = null;
  s: SVGLineElement = null;
  nw: SVGCircleElement = null;
  ne: SVGCircleElement = null;
  sw: SVGCircleElement = null;
  se: SVGCircleElement = null;
  labelBgDefs: SVGDefsElement = null;
  labelBg: SVGElement = null;
  label: SVGTextElement = null;
  label2: SVGTextElement = null;
  selectable: SVGRectElement = null;
  movingRect: { x: number; y: number; width: number; height: number } = null;
  constructor(parent: ImageAnnotation) {
    super(parent);

    this.renderDomElement();
  }
  calculateNewBox(position: SVGPoint, anchor: Anchor) {
    const { x, y, width, height } = this.movingRect;
    const baseRect = this.annotation.properties;
    let newBox = { x, y, width, height };

    if (anchor.includes("w")) {
      newBox.x = Math.min(position.x, baseRect.x + baseRect.width);
      newBox.width =
        Math.max(position.x, baseRect.x + baseRect.width) - newBox.x;
    }

    if (anchor.includes("n")) {
      newBox.y = Math.min(position.y, baseRect.y + baseRect.height);
      newBox.height =
        Math.max(position.y, baseRect.y + baseRect.height) - newBox.y;
    }

    if (anchor.includes("e")) {
      newBox.x = Math.min(position.x, baseRect.x);
      newBox.width = Math.max(position.x, baseRect.x) - newBox.x;
    }

    if (anchor.includes("s")) {
      newBox.y = Math.min(position.y, baseRect.y);
      newBox.height = Math.max(position.y, baseRect.y) - newBox.y;
    }

    return newBox;
  }
  handleSelect(evt: MouseEvent) {
    if (evt.button !== 0) {
      return;
    }

    evt.stopPropagation();
    evt.preventDefault();

    this.parent._annotationSelected(this.annotation);
  }
  handleDrag(evt: MouseEvent, anchor: Anchor) {
    if (evt.button !== 0) {
      return;
    }

    evt.stopPropagation();
    evt.preventDefault();

    const { x, y, width, height } = this.annotation.properties;
    this.movingRect = { x, y, width, height };

    const mouseMoveHandler = (evt: MouseEvent) => {
      evt.stopPropagation();
      evt.preventDefault();

      const position = this.parent._getImagePosition(evt);
      this.movingRect = this.calculateNewBox(position, anchor);
      this.update();
    };

    const mouseUpHandler = (evt: MouseEvent) => {
      evt.stopPropagation();
      evt.preventDefault();
      window.removeEventListener("mousemove", mouseMoveHandler);
      window.removeEventListener("mouseup", mouseUpHandler);

      const properties = {
        ...this.annotation.properties,
        x: this.movingRect.x,
        y: this.movingRect.y,
        width: this.movingRect.width,
        height: this.movingRect.height
      };
      const changed = { ...this.annotation, properties };

      this.movingRect = null;
      this.parent._annotationChanged(changed);
    };

    window.addEventListener("mousemove", mouseMoveHandler);
    window.addEventListener("mouseup", mouseUpHandler);
  }
  renderDomElement() {
    this.rect = getNode("rect", {
      "vector-effect": "non-scaling-stroke"
    }) as SVGRectElement;

    this.w = getNode("line", {
      "stroke-width": "10",
      "vector-effect": "non-scaling-stroke",
      stroke: "rgba(0,0,0,0.0001)"
    }) as SVGLineElement;
    this.e = getNode("line", {
      "stroke-width": "10",
      "vector-effect": "non-scaling-stroke",
      stroke: "rgba(0,0,0,0.0001)"
    }) as SVGLineElement;
    this.n = getNode("line", {
      "stroke-width": "10",
      "vector-effect": "non-scaling-stroke",
      stroke: "rgba(0,0,0,0.0001)"
    }) as SVGLineElement;
    this.s = getNode("line", {
      "stroke-width": "10",
      "vector-effect": "non-scaling-stroke",
      stroke: "rgba(0,0,0,0.0001)"
    }) as SVGLineElement;
    this.nw = getNode("circle", {
      r: "10",
      stroke: "rgba(0,0,0,0.0001)",
      fill: "rgba(0,0,0,0.0001)",
      "vector-effect": "non-scaling-stroke"
    }) as SVGCircleElement;
    this.ne = getNode("circle", {
      r: "10",
      stroke: "rgba(0,0,0,0.0001)",
      fill: "rgba(0,0,0,0.0001)",
      "vector-effect": "non-scaling-stroke"
    }) as SVGCircleElement;
    this.sw = getNode("circle", {
      r: "10",
      stroke: "rgba(0,0,0,0.0001)",
      fill: "rgba(0,0,0,0.0001)",
      "vector-effect": "non-scaling-stroke"
    }) as SVGCircleElement;
    this.se = getNode("circle", {
      r: "10",
      stroke: "rgba(0,0,0,0.0001)",
      fill: "rgba(0,0,0,0.0001)",
      "vector-effect": "non-scaling-stroke"
    }) as SVGCircleElement;

    this.w.style.cursor = "ew-resize";
    this.e.style.cursor = "ew-resize";
    this.n.style.cursor = "ns-resize";
    this.s.style.cursor = "ns-resize";
    this.nw.style.cursor = "nwse-resize";
    this.ne.style.cursor = "nesw-resize";
    this.sw.style.cursor = "nesw-resize";
    this.se.style.cursor = "nwse-resize";

    this.w.onmousedown = (evt: MouseEvent) => this.handleDrag(evt, "w");
    this.e.onmousedown = (evt: MouseEvent) => this.handleDrag(evt, "e");
    this.n.onmousedown = (evt: MouseEvent) => this.handleDrag(evt, "n");
    this.s.onmousedown = (evt: MouseEvent) => this.handleDrag(evt, "s");
    this.nw.onmousedown = (evt: MouseEvent) => this.handleDrag(evt, "nw");
    this.ne.onmousedown = (evt: MouseEvent) => this.handleDrag(evt, "ne");
    this.sw.onmousedown = (evt: MouseEvent) => this.handleDrag(evt, "sw");
    this.se.onmousedown = (evt: MouseEvent) => this.handleDrag(evt, "se");

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

    this.selectable = getNode("rect", {
      "stroke-width": "0"
    }) as SVGRectElement;
    this.selectable.setAttribute("class", "selectable-item");

    this.selectable.onclick = (evt: MouseEvent) => this.handleSelect(evt);
  }
  addBaseElements() {
    this.group.appendChild(this.labelBgDefs);
    this.group.appendChild(this.label);
    this.group.appendChild(this.label2);
    this.group.appendChild(this.rect);
  }
  addEditableElements() {
    this.group.appendChild(this.w);
    this.group.appendChild(this.e);
    this.group.appendChild(this.n);
    this.group.appendChild(this.s);
    this.group.appendChild(this.nw);
    this.group.appendChild(this.ne);
    this.group.appendChild(this.sw);
    this.group.appendChild(this.se);
  }
  addSelectableElements() {
    this.group.appendChild(this.selectable);
  }
  update() {
    const { editable, label, selectable } = this.annotation;
    const { style = {} } = this.annotation.properties;
    let { x, y, width, height } = this.annotation.properties;
    const { strokeColor, fillColor } = this.style;
    const scaleFactor = 1 / this.parent.status.scale;
    const strokeWidth = this.selected
      ? this.parent.options.selectedAnnotationStrokeWidth
      : this.parent.options.strokeWidth;

    if (this.movingRect) {
      x = this.movingRect.x;
      y = this.movingRect.y;
      width = this.movingRect.width;
      height = this.movingRect.height;
    }

    this.emptyContainer();

    if (isNullOrUndefined([x, y, width, height])) {
      return;
    }

    this.rect.setAttributeNS(null, "x", x.toString());
    this.rect.setAttributeNS(null, "y", y.toString());
    this.rect.setAttributeNS(null, "width", width.toString());
    this.rect.setAttributeNS(null, "height", height.toString());
    this.rect.setAttributeNS(null, "stroke-width", strokeWidth.toString());
    this.rect.setAttributeNS(null, "stroke", style.strokeColor || strokeColor);
    this.rect.setAttributeNS(null, "fill", style.fillColor || fillColor);

    this.w.setAttributeNS(null, "x1", x.toString());
    this.w.setAttributeNS(null, "y1", y.toString());
    this.w.setAttributeNS(null, "x2", x.toString());
    this.w.setAttributeNS(null, "y2", (y + height).toString());

    this.e.setAttributeNS(null, "x1", (x + width).toString());
    this.e.setAttributeNS(null, "y1", y.toString());
    this.e.setAttributeNS(null, "x2", (x + width).toString());
    this.e.setAttributeNS(null, "y2", (y + height).toString());

    this.n.setAttributeNS(null, "x1", x.toString());
    this.n.setAttributeNS(null, "y1", y.toString());
    this.n.setAttributeNS(null, "x2", (x + width).toString());
    this.n.setAttributeNS(null, "y2", y.toString());

    this.s.setAttributeNS(null, "x1", x.toString());
    this.s.setAttributeNS(null, "y1", (y + height).toString());
    this.s.setAttributeNS(null, "x2", (x + width).toString());
    this.s.setAttributeNS(null, "y2", (y + height).toString());

    this.nw.setAttributeNS(null, "cx", x.toString());
    this.nw.setAttributeNS(null, "cy", y.toString());

    this.ne.setAttributeNS(null, "cx", (x + width).toString());
    this.ne.setAttributeNS(null, "cy", y.toString());

    this.sw.setAttributeNS(null, "cx", x.toString());
    this.sw.setAttributeNS(null, "cy", (y + height).toString());

    this.se.setAttributeNS(null, "cx", (x + width).toString());
    this.se.setAttributeNS(null, "cy", (y + height).toString());

    this.labelBg.setAttributeNS(
      null,
      "flood-color",
      style.strokeColor || strokeColor
    );
    this.label.textContent = label || "";
    this.label.setAttributeNS(null, "x", (x + 0 * scaleFactor).toString());
    this.label.setAttributeNS(null, "y", (y - 3 * scaleFactor).toString());
    this.label.setAttributeNS(null, "font-size", `${scaleFactor}em`);
    this.label.setAttributeNS(null, "fill", style.strokeColor || strokeColor);
    this.label2.textContent = label || "";
    this.label2.setAttributeNS(null, "x", (x + 0 * scaleFactor).toString());
    this.label2.setAttributeNS(null, "y", (y - 3 * scaleFactor).toString());
    this.label2.setAttributeNS(null, "font-size", `${scaleFactor}em`);
    this.label2.setAttributeNS(null, "fill", "rgb(0,0,0)");

    this.selectable.setAttributeNS(null, "x", x.toString());
    this.selectable.setAttributeNS(null, "y", y.toString());
    this.selectable.setAttributeNS(null, "width", width.toString());
    this.selectable.setAttributeNS(null, "height", height.toString());

    let className = "";
    if (this.parent.options.showLabels === "always") {
      className += " label-always";
    }
    if (this.parent.options.showLabels === "hover" && !this.movingRect) {
      className += " label-hover";
    }
    if (selectable && !this.selected) {
      className += " selectable";
    }
    if (this.selected) {
      className += " selected";
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

export default Rect;
