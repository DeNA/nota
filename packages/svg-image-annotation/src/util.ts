import { ImageSize } from "./common";

export function getNode(
  type: string,
  attributes: { [key: string]: string } = {}
): SVGElement {
  const node = document.createElementNS("http://www.w3.org/2000/svg", type);

  for (let attribute in attributes) {
    if (/^xlink:(.+)$/.exec(attribute)) {
      node.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        attribute,
        attributes[attribute]
      );
    } else {
      node.setAttributeNS(null, attribute, attributes[attribute]);
    }
  }

  return node;
}

export function getImageSize(imageUri: string) {
  const promise = new Promise<ImageSize>((resolve, reject) => {
    if (imageUri === null) {
      reject(new Error("imageUri is required"));
    }

    const image = new Image();

    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight
      });
    };

    image.src = imageUri;
  });

  return promise;
}

export function getSVGPoint(svg: SVGSVGElement, evt: MouseEvent) {
  const svgpoint = svg.createSVGPoint();
  svgpoint.x = evt.clientX;
  svgpoint.y = evt.clientY;

  return svgpoint;
}

export function isNullOrUndefined(items: any[] = []) {
  return items.reduce((isNullOrUndefined, item) => {
    return isNullOrUndefined || (item === null || item === undefined);
  }, false);
}
