import * as Redux from "redux";
export as namespace Nota;
export = Nota;

declare namespace Nota {
  interface User {
    id: number,
    username: string,
    group: string
  }

  interface Action extends Redux.Action {
    type: string;
    [key: string]: any;
  }
  interface ErrorAction extends Action {
    error: Error;
  }
  export type Error = any;

  export type AnnotationState = { [key: number]: Annotation };
  export type AnnotationsReducer = Redux.Reducer<AnnotationState>;

  export interface changeModeAction extends Action { mode: string }
  export interface changeImageFiltersAction extends Action { filters: object }
  export interface changeAddAnnotationAction extends Action {
    addAnnotation: boolean;
  }
  export interface changeFilterTextAction extends Action { text: string }
  export interface changeShowFilterAction extends Action { filter: string }


  export interface Image {
    id?: number;
    status?: number;
    annotations?: Annotation[];
  }
  export interface fetchImageListSucceedAction extends Action {
    imageList: Image[];
  }

  export interface selectImageAction extends Action { imageId: number }
  export interface selectImageAnnotationAction extends Action {
    annotationId: number;
    imageId?: number;
  }
  export interface setBulkActionAction extends Action {
    action: { action: string; fromId: number };
    annotations: number[];
  }

  export interface setOptionsAction extends Action {
    options: {};
  }

  export interface changeAnnotationBoundariesAction extends Action {
    annotationId: number;
    boundaries: string;
  }

  export interface Annotation {
    id?: number;
    imageId?: number;
    boundaries?: string;
    labelsName?: string;
    labels?: string;
    status?: number;
    taskItemId? : number;
  }
  export interface persistAnnotationAction extends Action {
    annotation: Annotation;
    labelName?: string;
  }
  export interface persistAnnotationSucceedAction extends Action {
    annotation: Annotation;
  }
  export interface persistAnnotationErrorAction extends ErrorAction {}

  export interface updateAnnotationAction extends Action {
    annotation: Annotation;
  }
  export interface updateAnnotationSucceedAction extends Action {
    annotation: Annotation;
  }
  export interface updateAnnotationErrorAction extends ErrorAction {}

  export interface deleteAnnotationAction extends Action {
    annotation: Annotation;
  }
  export interface deleteAnnotationSucceedAction extends Action {
    annotation: Annotation;
  }
  export interface deleteAnnotationErrorAction extends ErrorAction {}

  export interface updateImageStatusAction extends Action { image: Image }
  export interface updateImageStatusSucceedAction extends Action {
    image: Image;
  }
  export interface updateImageStatusErrorAction extends ErrorAction {}

  export type LabelType = LabelTypeSingleSelection | LabelTypeBoolean;
  export interface LabelOptions<T extends LabelType> {
    default?: any;
    required: boolean;
  }
  export interface Label<T extends LabelType, O extends LabelOptions<T>> {
    name: string;
    label: string;
    type: T;
    hotkey?: string;
    options: O;
  }
  export type LabelDisplayTypeRadio = "RADIO";
  export type LabelDisplayTypeImage = "IMAGE";
  export type LabelDisplayTypeCheckbox = "CHECKBOX";
  export type LabelDisplayTypeDropdown = "DROPDOWN";

  export type OptionItem = { 
    label: string;
    value: string;
    hotkey?: string;
    imageUrl?: string;
  };
  export type LabelTypeSingleSelection = "SINGLE_SELECTION";
  export interface LabelOptionsSingleSelection extends LabelOptions<
  LabelTypeSingleSelection
  > {
    default?: string;
    itemWidth?: number;
    itemWidthReview?: number;
    items: OptionItem[];
    display: LabelDisplayTypeRadio | LabelDisplayTypeDropdown | LabelDisplayTypeImage;
  }
  export type LabelSingleSelection = Label<
    LabelTypeSingleSelection,
    LabelOptionsSingleSelection
  >;

  export type LabelTypeBoolean = "BOOLEAN";
  export interface LabelOptionsBoolean extends LabelOptions<LabelTypeBoolean> {
    default?: boolean;
    display: LabelDisplayTypeCheckbox;
  }
  export type LabelBoolean = Label<LabelTypeBoolean, LabelOptionsBoolean>;

  export type LabelTypeTextInput = "TEXT_INPUT";
  export interface LabelOptionsTextInput extends LabelOptions<LabelTypeTextInput> {
    regExp?: string;
    description: string;
  }
  export type LabelTextInput = Label<LabelTypeTextInput, LabelOptionsTextInput>;

  export type LabelTypeVideoTimestamp = "VIDEO_TIMESTAMP";
  export interface LabelOptionsVideoTimestamp extends LabelOptions<LabelTypeTextInput> {
    autoPopulate?: boolean;
    manuallyEditable?: boolean;
    description: string;
  }
  export type LabelVideoTimestamp = Label<LabelTypeVideoTimestamp, LabelOptionsVideoTimestamp>;
}
