export interface ImageSize {
  width: number;
  height: number;
}

export interface Position2D {
  x: number;
  y: number;
}

export interface Style {
  strokeColor?: string;
  fillColor?: string;
}

export interface Properties {
  style?: Style;
}
export interface RectangleProperties extends Properties {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PolygonProperties extends Properties {
  points: Position2D[];
}

export interface PointProperties extends Properties {
  position: Position2D;
}

export interface EpipolarPointProperties extends Properties {
  position: Position2D | null;
  lineEquation: {
    x: (y: number) => number,
    y: (x: number) => number,
    closestPoint: (x: number, y: number) => { x: number, y: number }
  } | null
}

export type AnnotationType = "RECTANGLE" | "POLYGON" | "POINT" | "EPIPOLAR_POINT";

interface AnnotationBase<T extends AnnotationType, P extends Properties> {
  id: string;
  type: T;
  editable?: boolean;
  selectable?: boolean;
  label?: string;
  properties: P;
}

export interface RectangleAnnotation
  extends AnnotationBase<"RECTANGLE", RectangleProperties> { }
export interface PolygonAnnotation
  extends AnnotationBase<"POLYGON", PolygonProperties> { }
export interface PointAnnotation
  extends AnnotationBase<"POINT", PointProperties> { }
export interface EpipolarPointAnnotation
  extends AnnotationBase<"EPIPOLAR_POINT", EpipolarPointProperties> { }
export type Annotation =
  | RectangleAnnotation
  | PolygonAnnotation
  | PointAnnotation
  | EpipolarPointAnnotation;

export interface NewProperties extends Properties { }

export interface RectangleNewAnnotation
  extends AnnotationBase<"RECTANGLE", NewProperties> { }
export interface PolygonNewAnnotation
  extends AnnotationBase<"POLYGON", NewProperties> { }
export interface PointNewAnnotation
  extends AnnotationBase<"POINT", NewProperties> { }

export type NewAnnotation =
  | RectangleNewAnnotation
  | PolygonNewAnnotation
  | PointNewAnnotation;
