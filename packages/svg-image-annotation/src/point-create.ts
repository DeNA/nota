import { PointAnnotation, PointNewAnnotation, Position2D } from "./common";
import ElementCreate from "./element-create";
import ImageAnnotation from "./index";
import PointCreateElement from "./point-create-element";

class PointCreate extends ElementCreate<PointNewAnnotation> {
  point: PointCreateElement = null;
  movingPoint: Position2D = null;
  constructor(
    annotation: PointNewAnnotation,
    parent: ImageAnnotation,
    canvas: SVGRectElement
  ) {
    super(annotation, parent, canvas);

    this.movingPoint = { x: 0, y: 0 };
    this.renderDomElement();
  }
  renderDomElement() {
    this.point = new PointCreateElement();
    this.group.appendChild(this.point.group);

    this.canvas.addEventListener("click", this.mouseClickHandler);
    this.point.handler.addEventListener("click", this.mouseClickHandler);
    window.addEventListener("mousemove", this.mouseMoveHandler);
  }
  mouseMoveHandler = (evt: MouseEvent) => {
    evt.stopPropagation();
    evt.preventDefault();

    const position = this.parent._getImagePosition(evt);
    this.movingPoint.x = position.x;
    this.movingPoint.y = position.y;

    this.update();
  };
  mouseClickHandler = (evt: MouseEvent) => {
    if (evt.button !== 0) {
      return;
    }

    evt.stopPropagation();
    evt.preventDefault();

    const { x, y } = this.parent._getImagePosition(evt);
    const properties = {
      ...this.annotation.properties,
      position: { x, y }
    };
    const created: PointAnnotation = { ...this.annotation, properties };

    this.movingPoint = null;
    this.parent._annotationCreated(created);
  };
  update() {
    this.point.update(
      this.movingPoint,
      this.annotation.properties.style,
      this.parent.status.scale,
      this.parent.options.maxScale
    );
  }
  destroy() {
    this.canvas.removeEventListener("click", this.mouseClickHandler);
    this.point.handler.removeEventListener("click", this.mouseClickHandler);
    window.removeEventListener("mousemove", this.mouseMoveHandler);
  }
}

export default PointCreate;
