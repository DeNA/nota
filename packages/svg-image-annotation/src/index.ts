import {
  Annotation,
  AnnotationType,
  ImageSize,
  NewAnnotation,
  Position2D
} from "./common";
import SVGControls from "./controls";
import Element from "./element";
import ElementCreate from "./element-create";
import "./main.css";
import Point from "./point";
import PointCreate from "./point-create";
import Polygon from "./polygon";
import PolygonCreate from "./polygon-create";
import Rect from "./rect";
import RectCreate from "./rect-create";
import { getImageSize, getNode, getSVGPoint } from "./util";

const createElement = (type: AnnotationType, parent: ImageAnnotation) => {
  switch (type) {
    case "POINT":
      return new Point(parent);
    case "RECTANGLE":
      return new Rect(parent);
    case "POLYGON":
      return new Polygon(parent);
    default:
  }
};

const createNewElement = (
  annotation: NewAnnotation,
  parent: ImageAnnotation,
  drawCanvas: SVGRectElement
) => {
  switch (annotation.type) {
    case "POINT":
      return new PointCreate(annotation, parent, drawCanvas);
    case "RECTANGLE":
      return new RectCreate(annotation, parent, drawCanvas);
    case "POLYGON":
      return new PolygonCreate(annotation, parent, drawCanvas);
    default:
  }
};

interface Elements {
  svg: SVGSVGElement;
  container: SVGGElement;
  drawCanvas: SVGRectElement;
  annotationsContainer: SVGGElement;
  drawingAnnotationsContainer: SVGGElement;
  outsideCanvas: SVGRectElement;
  image: SVGImageElement;
  defs: SVGDefsElement;
  filterBrightness: {
    feFuncR: SVGFEFuncRElement;
    feFuncG: SVGFEFuncGElement;
    feFuncB: SVGFEFuncBElement;
  };
}

interface Options {
  image: string;
  annotations?: Annotation[];
  imageBrightness?: number;
  controlled?: boolean;
  showControls?: boolean;
  showLabels?: boolean | "always" | "hover";
  scale?: number;
  minScale?: number;
  maxScale?: number;
  maxScaleClick?: number;
  outsideCanvas?: number;
  strokeWidth?: number;
  selectedAnnotationStrokeWidth?: number;
  outsideCanvasColor?: string;
  selectedAnnotation?: null;
  annotationChanged?: any;
  annotationCreated?: any;
  annotationSelected?: any;
  zoomSensibility?: number;
}

interface OptionsUpdate {
  image?: string;
  annotations?: Annotation[];
  imageBrightness?: number;
  controlled?: boolean;
  showControls?: boolean;
  showLabels?: boolean;
  scale?: number;
  minScale?: number;
  maxScale?: number;
  maxScaleClick?: number;
  outsideCanvas?: number;
  strokeWidth?: number;
  selectedAnnotationStrokeWidth?: number;
  outsideCanvasColor?: string;
  selectedAnnotation?: null;
  annotationChanged?: any;
  annotationCreated?: any;
  annotationSelected?: any;
  zoomSensibility?: number;
}

interface Status {
  annotations: Annotation[];
  imageSize: ImageSize;
  scale: number;
  translateX: number;
  translateY: number;
  drawing: ElementCreate<NewAnnotation>;
  ready: boolean;
  id: number;
  selectedAnnotation: string;
  busy: number;
  centered: boolean;
}

type AnnotationCache = { [key: string]: Element<Annotation> };

class ImageAnnotation {
  annotationCache: AnnotationCache = {};
  controls: SVGControls = null;
  elements: Elements = {
    svg: null,
    container: null,
    drawCanvas: null,
    annotationsContainer: null,
    drawingAnnotationsContainer: null,
    outsideCanvas: null,
    image: null,
    defs: null,
    filterBrightness: null
  };
  options: Options = {
    image: null,
    annotations: [],
    imageBrightness: 0,
    controlled: false,
    showControls: true,
    showLabels: false,
    scale: 1,
    minScale: 0.5,
    maxScale: 2,
    maxScaleClick: 2,
    outsideCanvas: 0,
    strokeWidth: 1,
    selectedAnnotationStrokeWidth: 2,
    outsideCanvasColor: "rgba(0,0,255,0.1)",
    selectedAnnotation: null,
    annotationChanged: null,
    annotationCreated: null,
    annotationSelected: null,
    zoomSensibility: 1
  };
  status: Status = {
    annotations: null,
    imageSize: null,
    scale: null,
    translateX: 0,
    translateY: 0,
    drawing: null,
    ready: false,
    id: null,
    selectedAnnotation: null,
    busy: null,
    centered: false
  };
  constructor(svg: SVGSVGElement, options: Options) {
    if (!svg || !options || !options.image) {
      throw new Error("svg and options.image are required");
    }

    this.elements.svg = svg;
    this.elements.svg.style.width = "100%";
    this.elements.svg.style.height = "100%";
    this.elements.svg.style.fontSize = "8pt";
    this.status.id = Math.random();
    this.elements.defs = getNode("defs") as SVGDefsElement;

    const filterBrightness = getNode("filter", {
      id: this.status.id + "_imageBrightness"
    });
    const feComponentTransfer = getNode("feComponentTransfer");
    this.elements.filterBrightness = {
      feFuncR: getNode("feFuncR", {
        type: "gamma",
        exponent: "1"
      }) as SVGFEFuncRElement,
      feFuncG: getNode("feFuncG", {
        type: "gamma",
        exponent: "1"
      }) as SVGFEFuncGElement,
      feFuncB: getNode("feFuncB", {
        type: "gamma",
        exponent: "1"
      }) as SVGFEFuncBElement
    };
    feComponentTransfer.appendChild(this.elements.filterBrightness.feFuncR);
    feComponentTransfer.appendChild(this.elements.filterBrightness.feFuncG);
    feComponentTransfer.appendChild(this.elements.filterBrightness.feFuncB);
    filterBrightness.appendChild(feComponentTransfer);
    this.elements.defs.appendChild(filterBrightness);

    this.options = { ...this.options, ...options };

    this.status.scale = this.options.scale;
    this.status.annotations = this.options.annotations;
    this.status.selectedAnnotation = this.options.selectedAnnotation;

    this.controls = new SVGControls(this);

    getImageSize(this.options.image).then(this._setup);
  }
  _setup = (imageSize: ImageSize) => {
    this.status.imageSize = imageSize;

    this.elements.container = getNode("g") as SVGGElement;
    this.elements.annotationsContainer = getNode("g") as SVGGElement;
    this.elements.drawingAnnotationsContainer = getNode("g") as SVGGElement;
    this._setupOutsideCanvas();
    this._setupImage();
    this._setupDrawCanvas();
    this._setupListeners();
    this._centerAndScale();

    this.status.ready = true;
  };
  _setupOutsideCanvas() {
    const { outsideCanvas, outsideCanvasColor } = this.options;
    const { imageSize } = this.status;

    this.elements.outsideCanvas = getNode("rect", {
      x: "0",
      y: "0",
      width: (imageSize.width + imageSize.width * outsideCanvas).toString(),
      height: (imageSize.height + imageSize.height * outsideCanvas).toString(),
      fill: outsideCanvasColor
    }) as SVGRectElement;
  }
  _setupImage() {
    const { image, outsideCanvas } = this.options;
    const { imageSize, id } = this.status;
    const { annotationsContainer } = this.elements;

    const translateX = (imageSize.width * outsideCanvas) / 2;
    const translateY = (imageSize.height * outsideCanvas) / 2;
    const transform = `translate(${translateX},${translateY})`;
    annotationsContainer.setAttributeNS(null, "transform", transform);

    this.elements.image = getNode("image", {
      x: "0",
      y: "0",
      width: imageSize.width.toString(),
      height: imageSize.height.toString(),
      "xlink:href": image,
      filter: `url(#${id}_imageBrightness)`
    }) as SVGImageElement;

    annotationsContainer.appendChild(this.elements.image);
  }
  _setupDrawCanvas() {
    const { outsideCanvas } = this.options;
    const { imageSize } = this.status;
    const { drawingAnnotationsContainer } = this.elements;

    const translateX = (imageSize.width * outsideCanvas) / 2;
    const translateY = (imageSize.height * outsideCanvas) / 2;
    const transform = `translate(${translateX},${translateY})`;
    drawingAnnotationsContainer.setAttributeNS(null, "transform", transform);

    this.elements.drawCanvas = getNode("rect", {
      x: "0",
      y: "0",
      width: (imageSize.width + imageSize.width * outsideCanvas).toString(),
      height: (imageSize.height + imageSize.height * outsideCanvas).toString(),
      fill: "rgba(0,0,0,0.0001)"
    }) as SVGRectElement;
    this.elements.drawCanvas.style.cursor = "crosshair";
  }
  _svgSize() {
    const { svg } = this.elements;

    const parentStyle = getComputedStyle(svg);
    const width = parseFloat(parentStyle.getPropertyValue("width"));
    const height = parseFloat(parentStyle.getPropertyValue("height"));

    return { width, height };
  }
  _calculateMinScale() {
    const { imageSize } = this.status;
    const { outsideCanvas, minScale, maxScale } = this.options;
    const svgSize = this._svgSize();

    const canvasWidth = imageSize.width * (1 + outsideCanvas / 3);
    const canvasHeight = imageSize.height * (1 + outsideCanvas / 3);
    const scale = Math.max(
      Math.min(
        svgSize.width / canvasWidth,
        svgSize.height / canvasHeight,
        maxScale
      ),
      minScale
    );

    return scale;
  }
  _centerAndScale() {
    const svgSize = this._svgSize();
    const { imageSize } = this.status;
    const { outsideCanvas } = this.options;

    const scale = this._calculateMinScale();
    const offsetX =
      (svgSize.width -
        (imageSize.width + imageSize.width * outsideCanvas) * scale) /
      2;
    const offsetY =
      (svgSize.height -
        (imageSize.height + imageSize.height * outsideCanvas) * scale) /
      2;

    const ctm = this._getCTM();
    ctm.a = scale;
    ctm.d = scale;
    ctm.e = offsetX;
    ctm.f = offsetY;

    this._setCTM(ctm);
    this.status.centered = true;
  }
  _setupListeners() {
    this._setupKeyboardListeners();
    this._setupMouseListeners();
    this._setupWheelZoom();
    this._setupDrag();
  }
  _handleMousedown = (evt: MouseEvent) => {
    if (evt.ctrlKey) {
      const { svg } = this.elements;
      const { maxScaleClick } = this.options;
      const { scale, centered } = this.status;

      if (!centered) {
        this._centerAndScale();
      } else {
        const svgpoint = getSVGPoint(svg, evt);
        const position = svgpoint.matrixTransform(svg.getScreenCTM().inverse());
        this._zoomAndPan(maxScaleClick / scale, position);
      }
    }
  };
  _setupMouseListeners() {
    this.elements.svg.addEventListener("mousedown", this._handleMousedown);
  }
  _handleKeydownEvent = (evt: KeyboardEvent) => {
    const { container } = this.elements;

    if (evt.shiftKey) {
      container.setAttribute("class", "shift-key");
    }
    if (evt.altKey) {
      container.setAttribute("class", "alt-key");
    }
  };
  _handleKeyupEvent = (evt: KeyboardEvent) => {
    const { container } = this.elements;

    container.setAttribute("class", "");
  };
  _setupKeyboardListeners() {
    window.addEventListener("keydown", this._handleKeydownEvent);
    window.addEventListener("keyup", this._handleKeyupEvent);
  }
  _cleanListeners() {
    window.removeEventListener("keydown", this._handleKeydownEvent);
    window.removeEventListener("keyup", this._handleKeyupEvent);
    this.elements.svg.removeEventListener("mousedown", this._handleMousedown);
  }
  _calculateZoom(sign: number) {
    return 1 + 0.1 * Math.sign(sign) * this.options.zoomSensibility;
  }
  _setupWheelZoom() {
    const { svg } = this.elements;

    svg.onwheel = evt => {
      const { maxScale } = this.options;
      const { scale } = this.status;

      evt.stopPropagation();
      evt.preventDefault();

      const svgpoint = getSVGPoint(svg, evt);
      const position = svgpoint.matrixTransform(svg.getScreenCTM().inverse());
      let zoom = this._calculateZoom(evt.deltaY > 0 ? 1 : -1);

      const newScale = zoom * scale;
      const minScale = this._calculateMinScale();
      if (newScale > maxScale) {
        zoom = maxScale / scale;
      } else if (newScale < minScale) {
        zoom = minScale / scale;
      }

      this._zoomAndPan(zoom, position);
    };
  }
  _setupDrag() {
    const { svg } = this.elements;

    svg.onmousedown = evt => {
      if (evt.button !== 0) {
        return;
      }

      evt.stopPropagation();
      evt.preventDefault();

      let up = false;
      let previousX = evt.clientX;
      let previousY = evt.clientY;

      const mouseMoveHandler = (evt: MouseEvent) => {
        evt.stopPropagation();
        evt.preventDefault();

        this._pan({ x: evt.clientX - previousX, y: evt.clientY - previousY });

        previousX = evt.clientX;
        previousY = evt.clientY;
      };

      const mouseUpHandler = (evt: MouseEvent) => {
        evt.stopPropagation();
        evt.preventDefault();
        up = true;
        window.removeEventListener("mousemove", mouseMoveHandler);
        window.removeEventListener("mouseup", mouseUpHandler);
      };

      window.addEventListener("mouseup", mouseUpHandler);
      setTimeout(() => {
        if (!up) {
          window.addEventListener("mousemove", mouseMoveHandler);
        }
      }, 150);
    };
  }
  _zoom(zoom: number) {
    const { svg } = this.elements;
    const { scale } = this.status;
    const { maxScale } = this.options;

    const minScale = this._calculateMinScale();
    const newScale = zoom * scale;
    if (newScale > maxScale) {
      zoom = maxScale / scale;
    } else if (newScale < minScale) {
      zoom = minScale / scale;
    }

    const parentStyle = getComputedStyle(svg);
    const svgWidth = parseFloat(parentStyle.getPropertyValue("width"));
    const svgHeight = parseFloat(parentStyle.getPropertyValue("height"));
    const svgpoint = svg.createSVGPoint();
    svgpoint.x = svgWidth / 2;
    svgpoint.y = svgHeight / 2;

    this._zoomAndPan(zoom, svgpoint);
  }
  _pan(position: Position2D) {
    const ctm = this._getCTM();
    ctm.e = ctm.e + position.x;
    ctm.f = ctm.f + position.y;

    this._setCTM(ctm);
    this.status.centered = false;
  }
  _zoomAndPan(zoom: number, position: SVGPoint) {
    const { svg } = this.elements;

    const ctm = this._getCTM();
    const relativePosition = position.matrixTransform(ctm.inverse());
    const modifier = svg
      .createSVGMatrix()
      .translate(relativePosition.x, relativePosition.y)
      .scale(zoom)
      .translate(-relativePosition.x, -relativePosition.y);
    const newCTM = ctm.multiply(modifier);

    this._setCTM(newCTM);
    this.status.centered = false;
  }
  _getCTM() {
    const { svg } = this.elements;
    const { scale, translateX, translateY } = this.status;

    const ctm = svg.createSVGMatrix();
    ctm.a = scale;
    ctm.b = 0;
    ctm.c = 0;
    ctm.d = scale;
    ctm.e = translateX;
    ctm.f = translateY;

    return ctm;
  }
  _setCTM(ctm: SVGMatrix) {
    const status = this.status;

    status.scale = ctm.a;
    status.translateX = ctm.e;
    status.translateY = ctm.f;

    this._render();
  }
  _getContainerTransform() {
    const { scale, translateX, translateY } = this.status;

    return `translate(${translateX}, ${translateY}) scale(${scale})`;
  }
  _getImagePosition(evt: MouseEvent) {
    const { svg, outsideCanvas, image } = this.elements;

    const svgpoint = getSVGPoint(svg, evt);
    const positionOffset = svgpoint.matrixTransform(
      outsideCanvas.getScreenCTM().inverse()
    );

    positionOffset.x = Math.min(
      positionOffset.x,
      parseFloat(outsideCanvas.getAttributeNS(null, "width"))
    );
    positionOffset.x = Math.max(positionOffset.x, 0);
    positionOffset.y = Math.min(
      positionOffset.y,
      parseFloat(outsideCanvas.getAttributeNS(null, "height"))
    );
    positionOffset.y = Math.max(positionOffset.y, 0);

    svgpoint.x = positionOffset.x;
    svgpoint.y = positionOffset.y;
    const fixedScreenPosition = svgpoint.matrixTransform(
      outsideCanvas.getScreenCTM()
    );

    svgpoint.x = fixedScreenPosition.x;
    svgpoint.y = fixedScreenPosition.y;
    const position = svgpoint.matrixTransform(image.getScreenCTM().inverse());

    return position;
  }
  _annotationChanged(changed: Annotation) {
    const { annotationChanged, controlled } = this.options;
    const { annotations } = this.status;
    let update = !controlled;

    if (annotationChanged) {
      if (annotationChanged(changed) === false) {
        update = false;
      }
    }

    if (update) {
      const index = annotations.findIndex(
        annotation => annotation.id === changed.id
      );

      if (index !== -1) {
        annotations.splice(index, 1, changed);
      }
    }

    this._render();
  }
  _annotationCreated(created: Annotation) {
    const { annotationCreated, controlled } = this.options;
    const { annotations } = this.status;
    let update = !controlled;

    this.status.drawing.destroy();
    this.status.drawing = null;

    if (annotationCreated) {
      if (annotationCreated(created) === false) {
        update = false;
      }
    }

    if (update) {
      annotations.push(created);
    }

    this._render();
  }
  _annotationSelected(selected: Annotation) {
    const { annotationSelected, controlled } = this.options;
    let update = !controlled;

    if (annotationSelected) {
      if (annotationSelected(selected) === false) {
        update = false;
      }
    }

    if (update) {
      this.status.selectedAnnotation = selected.id;
    }

    this._render();
  }
  _sortAnnotations(annotations: Annotation[], selectedAnnotation: string) {
    const sorted = annotations.sort((a, b) => {
      // Annotations with higher index are rendered on higher positions
      if (a.id === selectedAnnotation) {
        return 1;
      } else if (b.id === selectedAnnotation) {
        return -1;
      } else if (a.selectable && !b.selectable) {
        return 1;
      } else if (!a.selectable && b.selectable) {
        return -1;
      } else {
        return 0;
      }
    });

    return sorted;
  }
  _updateBrightness() {
    const { imageBrightness } = this.options;
    const { filterBrightness } = this.elements;
    const exponent =
      imageBrightness === 0
        ? 1
        : imageBrightness > 0
        ? 1 - imageBrightness * 0.1
        : 1 + Math.abs(imageBrightness) * 0.15;

    filterBrightness.feFuncR.setAttributeNS(
      null,
      "exponent",
      exponent.toString()
    );
    filterBrightness.feFuncG.setAttributeNS(
      null,
      "exponent",
      exponent.toString()
    );
    filterBrightness.feFuncB.setAttributeNS(
      null,
      "exponent",
      exponent.toString()
    );
  }
  _render() {
    if (this.status.busy) {
      window.cancelAnimationFrame(this.status.busy);
    }

    this.status.busy = window.requestAnimationFrame(() =>
      this._renderExecute()
    );
  }
  _renderExecute() {
    const {
      container,
      defs,
      outsideCanvas,
      annotationsContainer,
      image,
      svg,
      drawCanvas,
      drawingAnnotationsContainer
    } = this.elements;
    const { showControls } = this.options;
    const { drawing, selectedAnnotation } = this.status;

    container.setAttributeNS(null, "transform", this._getContainerTransform());

    const annotations = this._sortAnnotations(
      this.status.annotations,
      selectedAnnotation
    );

    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    svg.appendChild(defs);
    svg.appendChild(container);

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(outsideCanvas);
    container.appendChild(annotationsContainer);

    while (annotationsContainer.firstChild) {
      annotationsContainer.removeChild(annotationsContainer.firstChild);
    }
    annotationsContainer.appendChild(image);

    while (drawingAnnotationsContainer.firstChild) {
      drawingAnnotationsContainer.removeChild(
        drawingAnnotationsContainer.firstChild
      );
    }

    container.setAttributeNS(null, "transform", this._getContainerTransform());
    this._updateBrightness();

    for (let annotation of annotations) {
      const element =
        this.annotationCache[annotation.id] ||
        createElement(annotation.type, this);

      element.setSelected(selectedAnnotation === annotation.id);
      element.setAnnotation(annotation);
      this.annotationCache[annotation.id] = element;

      const rendered = element.getDomElement();

      if (element instanceof Point) {
        element.update();
      }

      rendered && annotationsContainer.appendChild(rendered);
    }

    if (drawing) {
      if (drawing instanceof PointCreate) {
        drawing.update();
      }
      container.appendChild(drawCanvas);
      drawingAnnotationsContainer.appendChild(drawing.getDomElement());
      container.appendChild(drawingAnnotationsContainer);
    }

    if (showControls) {
      svg.appendChild(this.controls.getDomElement());
    }
  }
  drawAnnotation(annotation: Annotation) {
    const { ready } = this.status;

    if (ready) {
      this._drawAnnotation(annotation);
    } else {
      setTimeout(() => {
        this.drawAnnotation(annotation);
      }, 10);
    }
  }
  _drawAnnotation(annotation: NewAnnotation) {
    const { drawCanvas } = this.elements;
    const status = this.status;

    if (status.drawing) {
      this._stopDrawing();
    }

    if (annotation === null) {
      this._render();
      return;
    }

    annotation.properties = annotation.properties || {};
    annotation.properties.style = annotation.properties.style || {};
    this.status.drawing = createNewElement(annotation, this, drawCanvas);
    this._render();
  }
  _stopDrawing() {
    const status = this.status;

    if (status.drawing) {
      status.drawing.destroy();
    }

    status.drawing = null;
  }
  setAnnotations(annotations: Annotation[]) {
    this.setOptions({ annotations });
  }
  getAnnotations() {
    return this.status.annotations;
  }
  setOptions(newOptions: OptionsUpdate = {}) {
    const { ready } = this.status;

    if (ready) {
      this._setOptions(newOptions);
    } else {
      setTimeout(() => {
        this.setOptions(newOptions);
      }, 10);
    }
  }
  _setOptions(newOptions: OptionsUpdate = {}) {
    const options = this.options;
    const status = this.status;
    let renderCanvas = false;
    let render = false;

    // annotations
    if (
      newOptions.annotations &&
      newOptions.annotations !== options.annotations
    ) {
      render = true;
      options.annotations = newOptions.annotations;
      status.annotations = newOptions.annotations;

      // Update cache of elements
      const newCache: AnnotationCache = {};
      newOptions.annotations.forEach(annotation => {
        const cached = this.annotationCache[annotation.id];
        if (cached) {
          newCache[annotation.id] = cached;
        }
      });
      Object.keys(this.annotationCache)
        .filter(key => newCache[key])
        .forEach(key => this.annotationCache[key].destroy());
      this.annotationCache = newCache;
    }

    // imageBrightness
    if (
      newOptions.imageBrightness !== undefined &&
      newOptions.imageBrightness !== options.imageBrightness
    ) {
      render = true;
      options.imageBrightness = newOptions.imageBrightness;
    }

    // strokeWidth
    if (
      newOptions.strokeWidth !== undefined &&
      newOptions.strokeWidth !== options.strokeWidth
    ) {
      render = true;
      options.strokeWidth = newOptions.strokeWidth;
    }

    // selectedAnnotationStrokeWidth
    if (
      newOptions.selectedAnnotationStrokeWidth !== undefined &&
      newOptions.selectedAnnotationStrokeWidth !==
        options.selectedAnnotationStrokeWidth
    ) {
      render = true;
      options.selectedAnnotationStrokeWidth =
        newOptions.selectedAnnotationStrokeWidth;
    }

    // controlled
    if (
      newOptions.controlled !== undefined &&
      newOptions.controlled !== options.controlled
    ) {
      options.controlled = newOptions.controlled;
    }

    // showControls
    if (
      newOptions.showControls !== undefined &&
      newOptions.showControls !== options.showControls
    ) {
      render = true;
      options.showControls = newOptions.showControls;
    }

    // scale
    if (newOptions.scale !== undefined && newOptions.scale !== options.scale) {
      render = true;
      options.scale = newOptions.scale;
      status.scale = newOptions.scale;
    }

    // minScale
    if (
      newOptions.minScale !== undefined &&
      newOptions.minScale !== options.minScale
    ) {
      options.minScale = newOptions.minScale;
    }

    // maxScale
    if (
      newOptions.maxScale !== undefined &&
      newOptions.maxScale !== options.maxScale
    ) {
      options.maxScale = newOptions.maxScale;
    }

    // maxScaleClick
    if (
      newOptions.maxScaleClick !== undefined &&
      newOptions.maxScaleClick !== options.maxScaleClick
    ) {
      options.maxScaleClick = newOptions.maxScaleClick;
    }

    // zoomSensibility
    if (
      newOptions.zoomSensibility !== undefined &&
      newOptions.zoomSensibility !== options.zoomSensibility
    ) {
      options.zoomSensibility = newOptions.zoomSensibility;
    }

    // outsideCanvas
    if (
      newOptions.outsideCanvas !== undefined &&
      newOptions.outsideCanvas !== options.outsideCanvas
    ) {
      renderCanvas = true;
      options.outsideCanvas = newOptions.outsideCanvas;
    }

    // selectedAnnotation
    if (
      newOptions.selectedAnnotation !== undefined &&
      newOptions.selectedAnnotation !== options.selectedAnnotation
    ) {
      render = true;
      options.selectedAnnotation = newOptions.selectedAnnotation;
      status.selectedAnnotation = newOptions.selectedAnnotation;
    }

    // annotationChanged
    if (
      newOptions.annotationChanged !== undefined &&
      newOptions.annotationChanged !== options.annotationChanged
    ) {
      options.annotationChanged = newOptions.annotationChanged;
    }

    // annotationCreated
    if (
      newOptions.annotationCreated !== undefined &&
      newOptions.annotationCreated !== options.annotationCreated
    ) {
      options.annotationCreated = newOptions.annotationCreated;
    }

    // annotationSelected
    if (
      newOptions.annotationSelected !== undefined &&
      newOptions.annotationSelected !== options.annotationSelected
    ) {
      options.annotationSelected = newOptions.annotationSelected;
    }

    // showLabels
    if (
      newOptions.showLabels !== undefined &&
      newOptions.showLabels !== options.showLabels
    ) {
      options.showLabels = newOptions.showLabels;
    }

    // image
    if (newOptions.image !== undefined && options.image !== newOptions.image) {
      options.image = newOptions.image;
      getImageSize(options.image).then(this._setup);
    } else if (renderCanvas) {
      this._setup(status.imageSize);
    } else if (render) {
      this._render();
    }
  }
  destroy() {
    this._stopDrawing();
    this._cleanListeners();
  }
}

export default ImageAnnotation;
