import { EpipolarPointAnnotation, Position2D } from "./common";
import Element from "./element";
import ImageAnnotation from "./index";
import PointCreateElement from "./point-create-element";
import { getNode, isNullOrUndefined } from "./util";

class EpipolarPoint extends Element<EpipolarPointAnnotation> {
  line: SVGLineElement = null;
  point: SVGLineElement = null;
  stroke: SVGLineElement = null;
  handler: SVGCircleElement = null;
  editingPoint: PointCreateElement = null;
  labelBgDefs: SVGDefsElement = null;
  labelBg: SVGElement = null;
  label: SVGTextElement = null;
  label2: SVGTextElement = null;
  selectable: SVGCircleElement = null;
  movingPoint: Position2D = null;
  isEditing: boolean = false;
  constructor(parent: ImageAnnotation) {
    super(parent);

    this.movingPoint = { x: 0, y: 0 }
    this.renderDomElement();
  }
  handleSelect(evt: MouseEvent) {
    if (evt.button !== 0) {
      return;
    }

    evt.stopPropagation();
    evt.preventDefault();

    this.parent._annotationSelected(this.annotation);
  }
  renderDomElement() {
    this.line = getNode("line", {
      "vector-effect": "non-scaling-stroke"
    }) as SVGLineElement;
    this.point = getNode("line", {
      "vector-effect": "non-scaling-stroke",
      "stroke-linecap": "round"
    }) as SVGLineElement;
    this.stroke = getNode("line", {
      "vector-effect": "non-scaling-stroke",
      "stroke-linecap": "round",
      stroke: "rgba(0,0,0,0.9)"
    }) as SVGLineElement;
    this.handler = getNode("circle", {
      r: "10",
      stroke: "rgba(0,0,0,0.0001)",
      fill: "rgba(0,0,0,0.0001)",
      "vector-effect": "non-scaling-stroke",
      class: "epipolar-point"
    }) as SVGCircleElement;
    this.editingPoint = new PointCreateElement();

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
      "text-anchor": "middle"
    }) as SVGTextElement;
    this.label2 = getNode("text", {
      "text-anchor": "middle"
    }) as SVGTextElement;

    this.selectable = getNode("circle", {
      "stroke-width": "0"
    }) as SVGCircleElement;
    this.selectable.setAttribute("class", "selectable-item");

    this.selectable.onclick = (evt: MouseEvent) => this.handleSelect(evt);

    this.handler.onmousedown = evt => {
      if (evt.button !== 0) {
        return;
      }

      evt.stopPropagation();
      evt.preventDefault();

      this.isEditing = true;

      const mouseUpHandler = (evt: MouseEvent) => {
        evt.stopPropagation();
        evt.preventDefault();
        window.removeEventListener("mouseup", mouseUpHandler);
        this.isEditing = false;

        const properties = {
          ...this.annotation.properties,
          position: { x: this.movingPoint.x, y: this.movingPoint.y }
        };
        const changed = { ...this.annotation, properties };

        this.parent._annotationChanged(changed);
      };
      window.addEventListener("mouseup", mouseUpHandler);
    };

    this.handler.addEventListener("click", this.handlePointRemove);
    this.parent.elements.container.addEventListener("mouseenter", this.mouseEnterHandler);
    this.parent.elements.container.addEventListener("mouseleave", this.mouseLeaveHandler);
  }
  annotationWasSet() {
    if (!this.annotation.properties.position) {
      this.parent.elements.container.addEventListener("click", this.mouseClickHandler);
    }
  }
  mouseEnterHandler = (evt: MouseEvent) => {
    evt.stopPropagation();
    evt.preventDefault();

    window.addEventListener("mousemove", this.mouseMoveHandler);
  }
  mouseLeaveHandler = (evt: MouseEvent) => {
    evt.stopPropagation();
    evt.preventDefault();

    window.removeEventListener("mousemove", this.mouseMoveHandler);
  }
  mouseClickHandler = (evt: MouseEvent) => {
    if (evt.button !== 0) {
      return;
    }

    evt.stopPropagation();
    evt.preventDefault();

    this.parent.elements.container.removeEventListener("click", this.mouseClickHandler);

    const properties = {
      ...this.annotation.properties,
      position: this.movingPoint
    };
    const changed = { ...this.annotation, properties };

    this.parent._annotationChanged(changed);
  };
  mouseMoveHandler = (evt: MouseEvent) => {
    const { lineEquation } = this.annotation.properties;

    evt.stopPropagation();
    evt.preventDefault();

    const position = this.parent._getImagePosition(evt);
    const pointPosition = evt.altKey && lineEquation ? lineEquation.closestPoint(position.x, position.y) : position;

    this.movingPoint.x = pointPosition.x;
    this.movingPoint.y = pointPosition.y;

    this.update();
  };
  handlePointRemove = (evt: MouseEvent) => {
    if (evt.button !== 0 || !evt.shiftKey) {
      return;
    }

    evt.stopPropagation();
    evt.preventDefault();

    const changed: EpipolarPointAnnotation = {
      ...this.annotation,
      properties: { ...this.annotation.properties, position: null }
    };

    this.parent._annotationChanged(changed)
  }
  addBaseElements() {
    this.group.appendChild(this.labelBgDefs);
    this.group.appendChild(this.label);
    this.group.appendChild(this.label2);
    this.group.appendChild(this.stroke);
    this.group.appendChild(this.point);
  }
  addEditableElements() {
    this.group.appendChild(this.handler);
  }
  addSelectableElements() {
    this.group.appendChild(this.selectable);
  }
  addEditingElements() {
    this.group.appendChild(this.editingPoint.group);
  }
  updateLine() {
    const { strokeColor } = this.style;
    const { style = {}, lineEquation } = this.annotation.properties;
    const { width, height } = this.parent.status.imageSize;
    const x1 = 0;
    const x2 = width;
    const y1 = Math.min(height, Math.max(0, lineEquation.y(x1)));
    const y2 = Math.min(height, Math.max(0, lineEquation.y(x2)));

    this.line.setAttributeNS(null, "x1", x1.toString());
    this.line.setAttributeNS(null, "x2", x2.toString());
    this.line.setAttributeNS(null, "y1", y1.toString());
    this.line.setAttributeNS(null, "y2", y2.toString());
    this.line.setAttributeNS(null, "stroke", style.strokeColor || strokeColor);
    this.line.setAttributeNS(null, "strokeWidth", "5");

    this.group.appendChild(this.line);
  }
  updateEditing() {
    this.editingPoint.update(
      this.movingPoint,
      this.annotation.properties.style,
      this.parent.status.scale,
      this.parent.options.maxScale
    );

    this.addEditingElements();
  }
  updateStatic() {
    const { editable, label, selectable } = this.annotation;
    const {
      position = { x: undefined, y: undefined },
      style = {}
    } = this.annotation.properties;
    const { x, y } = position;
    const { strokeColor } = this.style;
    const scaleFactor = 1 / this.parent.status.scale;
    const strokeWidth = this.selected
      ? this.parent.options.selectedAnnotationStrokeWidth
      : this.parent.options.strokeWidth;

    if (!isNullOrUndefined([x, y])) {
      this.point.setAttributeNS(null, "x1", x.toString());
      this.point.setAttributeNS(null, "y1", y.toString());
      this.point.setAttributeNS(null, "x2", x.toString());
      this.point.setAttributeNS(null, "y2", y.toString());
      this.point.setAttributeNS(null, "stroke", style.strokeColor || strokeColor);
      this.point.setAttributeNS(
        null,
        "stroke-width",
        (strokeWidth * 4).toString()
      );
      this.stroke.setAttributeNS(null, "x1", x.toString());
      this.stroke.setAttributeNS(null, "y1", y.toString());
      this.stroke.setAttributeNS(null, "x2", x.toString());
      this.stroke.setAttributeNS(null, "y2", y.toString());
      this.stroke.setAttributeNS(
        null,
        "stroke-width",
        (strokeWidth * 4 + 2).toString()
      );
      this.handler.setAttributeNS(null, "cx", x.toString());
      this.handler.setAttributeNS(null, "cy", y.toString());

      this.labelBg.setAttributeNS(
        null,
        "flood-color",
        style.strokeColor || strokeColor
      );
      this.label.textContent = label || "";
      this.label.setAttributeNS(null, "x", x.toString());
      this.label.setAttributeNS(null, "y", (y - 5 * scaleFactor).toString());
      this.label.setAttributeNS(null, "font-size", scaleFactor + "em");
      this.label.setAttributeNS(null, "fill", style.strokeColor || strokeColor);
      this.label2.textContent = label || "";
      this.label2.setAttributeNS(null, "x", x.toString());
      this.label2.setAttributeNS(null, "y", (y - 5 * scaleFactor).toString());
      this.label2.setAttributeNS(null, "font-size", scaleFactor + "em");
      this.label2.setAttributeNS(null, "fill", "rgb(0,0,0)");

      this.selectable.setAttributeNS(null, "cx", x.toString());
      this.selectable.setAttributeNS(null, "cy", y.toString());
      this.selectable.setAttributeNS(null, "r", (strokeWidth * 4).toString());
    }

    let className = "";
    if (this.parent.options.showLabels === "always") {
      className += " label-always";
    }
    if (this.parent.options.showLabels === "hover" && !this.movingPoint) {
      className += " label-hover";
    }
    if (selectable && !this.selected) {
      className += " selectable";
    }
    if (this.selected) {
      className += " selected";
    }
    if (editable) {
      className += " editable";
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
  update() {
    const {
      position = { x: undefined, y: undefined },
      lineEquation
    } = this.annotation.properties;

    this.emptyContainer();

    if (lineEquation) {
      this.updateLine();
    }

    if (lineEquation && (isNullOrUndefined([position?.x, position?.y]) || this.isEditing)) {
      this.updateEditing();
    } else if (!isNullOrUndefined([position?.x, position?.y])) {
      this.updateStatic();
    }
  }
  destroy() {
    this.handler.removeEventListener("click", this.handlePointRemove);
    this.parent.elements.container.removeEventListener("mouseenter", this.mouseEnterHandler);
    this.parent.elements.container.removeEventListener("mouseleave", this.mouseLeaveHandler);
    this.parent.elements.container.removeEventListener("click", this.mouseClickHandler);
  }
}

export default EpipolarPoint;
