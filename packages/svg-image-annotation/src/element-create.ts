import { getNode } from "./util";
import { NewAnnotation } from "./common";
import ImageAnnotation from "./index";

class ElementCreate<T extends NewAnnotation> {
  annotation: T = null;
  canvas: SVGRectElement = null;
  group: SVGGElement = null;
  parent: ImageAnnotation = null;
  style = {
    strokeColor: "black",
    fillColor: "rgba(0,0,0,0)"
  };
  constructor(annotation: T, parent: ImageAnnotation, canvas: SVGRectElement) {
    this.annotation = annotation;
    this.canvas = canvas;
    this.parent = parent;
    this.group = getNode("g") as SVGGElement;
  }
  setAnnotation(annotation: T) {}
  getDomElement() {
    return this.group;
  }
  destroy() {}
}

export default ElementCreate;
