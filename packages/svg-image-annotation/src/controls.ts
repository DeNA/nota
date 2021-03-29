import { getNode } from "./util";
import ImageAnnotation from "./index";

const resetPath =
  "M755 819v448q0 26-19 45t-45 19-45-19l-144-144-332 332q-10 10-23 10t-23-10L10 1386q-10-10-10-23t10-23l332-332-144-144q-19-19-19-45t19-45 45-19h448q26 0 45 19t19 45zm755-672q0 13-10 23l-332 332 144 144q19 19 19 45t-19 45-45 19H819q-26 0-45-19t-19-45V243q0-26 19-45t45-19 45 19l144 144 332-332q10-10 23-10t23 10l114 114q10 10 10 23z";
const minusPath =
  "M1408 96v192q0 40-28 68t-68 28H96q-40 0-68-28T0 288V96q0-40 28-68T96 0h1216q40 0 68 28t28 68z";
const plusPath =
  "M1408 608v192q0 40-28 68t-68 28H896v416q0 40-28 68t-68 28H608q-40 0-68-28t-28-68V896H96q-40 0-68-28T0 800V608q0-40 28-68t68-28h416V96q0-40 28-68t68-28h192q40 0 68 28t28 68v416h416q40 0 68 28t28 68z";

class SVGControls {
  parent: ImageAnnotation = null;
  controls: SVGGElement = null;
  constructor(parent: ImageAnnotation) {
    this.parent = parent;
    this._createControls();
  }
  _createControls() {
    const reset = getNode("path", {
      d: resetPath,
      fill: "white"
    });
    const resetRect = getNode("rect", {
      x: "-250",
      y: "-250",
      width: "2000",
      height: "2000",
      fill: "black",
      "fill-opacity": "0.33"
    });
    const resetGroup = getNode("g", {
      transform: "translate(500,2900)"
    });
    resetGroup.onclick = evt => {
      this.parent._centerAndScale();
    };
    resetGroup.appendChild(resetRect);
    resetGroup.appendChild(reset);
    const minus = getNode("path", {
      d: minusPath,
      fill: "white"
    });
    const minusRect = getNode("rect", {
      x: "-250",
      y: "-750",
      width: "2000",
      height: "2000",
      fill: "black",
      "fill-opacity": "0.33"
    });
    const minusGroup = getNode("g", {
      transform: "translate(500,5800)"
    });
    minusGroup.onclick = evt => {
      this.parent._zoom(this.parent._calculateZoom(-1));
    };
    minusGroup.appendChild(minusRect);
    minusGroup.appendChild(minus);
    const plus = getNode("path", {
      d: plusPath,
      fill: "white"
    });
    const plusRect = getNode("rect", {
      x: "-250",
      y: "-250",
      width: "2000",
      height: "2000",
      fill: "black",
      "fill-opacity": "0.33"
    });
    const plusGroup = getNode("g", {
      transform: "translate(500,500)"
    });
    plusGroup.onclick = evt => {
      this.parent._zoom(this.parent._calculateZoom(1));
    };
    plusGroup.appendChild(plusRect);
    plusGroup.appendChild(plus);
    this.controls = getNode("g", {
      transform: "scale(0.010)"
    }) as SVGGElement;
    this.controls.appendChild(resetGroup);
    this.controls.appendChild(minusGroup);
    this.controls.appendChild(plusGroup);
  }
  getDomElement() {
    return this.controls;
  }
  destroy() {
    throw new Error("Not Implemented");
  }
}

export default SVGControls;
