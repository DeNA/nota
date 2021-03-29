import { PointAnnotation, Position2D } from "./common";
import Element from "./element";
import ImageAnnotation from "./index";
import PointCreateElement from "./point-create-element";
import { getNode, isNullOrUndefined } from "./util";

class Point extends Element<PointAnnotation> {
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
  constructor(parent: ImageAnnotation) {
    super(parent);

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
      "vector-effect": "non-scaling-stroke"
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

      const { x, y } = this.annotation.properties.position;
      this.movingPoint = { x, y };

      const mouseMoveHandler = (evt: MouseEvent) => {
        evt.stopPropagation();
        evt.preventDefault();

        const position = this.parent._getImagePosition(evt);
        this.movingPoint.x = position.x;
        this.movingPoint.y = position.y;

        this.update();
      };

      const mouseUpHandler = (evt: MouseEvent) => {
        evt.stopPropagation();
        evt.preventDefault();
        window.removeEventListener("mousemove", mouseMoveHandler);
        window.removeEventListener("mouseup", mouseUpHandler);

        const properties = {
          ...this.annotation.properties,
          position: { x: this.movingPoint.x, y: this.movingPoint.y }
        };
        const changed = { ...this.annotation, properties };

        this.movingPoint = null;
        this.parent._annotationChanged(changed);
      };

      window.addEventListener("mousemove", mouseMoveHandler);
      window.addEventListener("mouseup", mouseUpHandler);
    };
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

    if (isNullOrUndefined([x, y])) {
      return;
    }

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
    this.emptyContainer();

    if (this.movingPoint) {
      this.updateEditing();
    } else {
      this.updateStatic();
    }
  }
  destroy() {}
}

export default Point;
