# svg-image-annotation

## API

```javascript
const annotations = [{
  // required, unique or it might be overriden or ignored
  id: string,
  // required, "rect", "point", "polygon"
  type: "rect",
  // default true
  editable: boolean,
  // default false
  selectable: boolean,
  // optional label
  label: string,
  // point properties
  properties: {
    // required, position in pixels relative to image
    position: { x: number, y: number },
    // optional style
    style: {
      // defaults to black
      color: cssColorString
    }
  },
  // rect properties
  properties: {
    // required positioning and size
    x: number,
    y: number,
    width: number,
    height: number,
    // optional style
    style: {
      // defaults to black
      strokeColor: cssColorString,
      // defaults to no fill color
      fillColor: cssColorString
    }
  },
  // polygon properties
  properties: {
    // required array of position objects { x: number, y: number }, minimum is 3 points
    points: position[],
    // optional style
    style: {
      // defaults to black
      strokeColor: cssColorString,
      // defaults to no fill color
      fillColor: cssColorString
    }
  }
}];

const options = {
  // required
  image: imageUri,
  // default []
  annotations: annotations,
  // default 0, accepted integers [-5 .. 5]
  imageBrightness: number,
  // true => only external updates, false => internal + external updates, default false
  controlled: boolean,
  // default true
  showControls: boolean,
  // default 1
  scale: number,
  // default 0.5
  minScale: number,
  // default 2
  maxScale: number,
  // default 0, min 0, relative to image size
  outsideCanvas: number,
  // default null, id of an annotation to be selected
  selectedAnnotation: string,
  // default 2
  strokeWidth: number,
  // default 5
  selectedAnnotationStrokeWidth: number,
  // event listener, called on mouseup, etc, cancellable if not controlled, ignored if controlled
  annotationChanged: (annotation) => boolean,
  // event listener, called when annotation creation is finished, cancellable if not controlled, ignored if controlled
  annotationCreated: (annotation) => boolean,
  // event listener, called when a selectable annotation is selected, cancellable if not controlled, ignored if controlled
  annotationSelected: (annotation) => boolean
}

const svgAnnotation = new SvgAnnotation(svg, options);

svgAnnotation.setAnnotations(annotations); // replaces annotations and re-renders, shortcut for setOptions({annotations})
svgAnnotation.getAnnotations(); // gets annotations at the request time
svgAnnotation.setOptions(options); // updates options and re-renders if necessary
svgAnnotation.destroy(); // remove all events, svg children, etc

const newAnnotation = {
  // required, unique or it might be overriden or ignored
  id: string,
  // required, "rect", "point", "polygon"
  type: "rect"
}
// pass null to cancel an ongoing newAnnotation
svgAnnotation.drawAnnotation(newAnnotation);
```

## Build and release

- Build
```
npm run build
```
- Update `package.json` version
- Commit / Pull Request
- Create a Tag/Release for the version using the semver format