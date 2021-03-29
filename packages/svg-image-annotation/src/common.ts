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

export type AnnotationType = "RECTANGLE" | "POLYGON" | "POINT";

interface AnnotationBase<T extends AnnotationType, P extends Properties> {
  id: string;
  type: T;
  editable?: boolean;
  selectable?: boolean;
  label?: string;
  properties: P;
}

export interface RectangleAnnotation
  extends AnnotationBase<"RECTANGLE", RectangleProperties> {}
export interface PolygonAnnotation
  extends AnnotationBase<"POLYGON", PolygonProperties> {}
export interface PointAnnotation
  extends AnnotationBase<"POINT", PointProperties> {}
export type Annotation =
  | RectangleAnnotation
  | PolygonAnnotation
  | PointAnnotation;

export interface NewProperties extends Properties {}

interface NewAnnotationBase<T extends AnnotationType, P extends NewProperties> {
  id: string;
  type: T;
  editable?: boolean;
  selectable?: boolean;
  label?: string;
  properties: P;
}

export interface RectangleNewAnnotation
  extends AnnotationBase<"RECTANGLE", NewProperties> {}
export interface PolygonNewAnnotation
  extends AnnotationBase<"POLYGON", NewProperties> {}
export interface PointNewAnnotation
  extends AnnotationBase<"POINT", NewProperties> {}

export type NewAnnotation =
  | RectangleNewAnnotation
  | PolygonNewAnnotation
  | PointNewAnnotation;
