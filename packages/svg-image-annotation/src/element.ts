import { getNode } from "./util";
import ImageAnnotation from "./index";
import { Annotation, AnnotationType } from "./common";

class Element<T extends Annotation> {
  parent: ImageAnnotation = null;
  group: SVGGElement = null;
  annotation: T = null;
  selected: boolean = false;
  style = {
    strokeColor: "rgba(255,255,0,1)",
    fillColor: "rgba(0,0,0,0)"
  };
  constructor(parent: ImageAnnotation) {
    this.parent = parent;
    this.group = getNode("g") as SVGGElement;
  }
  setSelected(selected: boolean) {
    this.selected = selected;
  }
  setAnnotation(annotation: T) {
    this.annotation = annotation;
    this.annotationWasSet();
    this.update();
  }
  emptyContainer() {
    while (this.group.firstChild) {
      this.group.removeChild(this.group.firstChild);
    }
  }
  annotationWasSet() {}
  update() {}
  destroy() {}

  getDomElement() {
    return this.group;
  }
}

export default Element;
