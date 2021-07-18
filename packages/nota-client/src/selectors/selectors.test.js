import {
  ACTION_CREATE_ANNOTATION,
  IMAGE_STATUS_DONE,
  IMAGE_STATUS_ONGOING,
  OPTION_FOCUS,
  OPTION_NOOP,
  OPTION_POPUP_FOCUS
} from "../constants";
import { Annotation } from "../lib/models";
import { selector } from "../lib/selector";
import { registerSelectors } from "./registerSelectors";
import {
  annotation,
  annotationBoundaries,
  annotationDone,
  annotationFieldAnnotations,
  annotationFields,
  annotationLabelFocus,
  annotationLabelPopup,
  annotationTemplate,
  annotationValues,
  doneImages,
  firstOngoingImageAnnotationId,
  firstOngoingImageId,
  folderTemplate,
  folderTemplateAnnotations,
  folderTemplateOptions,
  folderTemplateShownMetadataFields,
  image,
  imageAnnotations,
  imageDone,
  imageUri,
  newAnnotationType
} from "./selectors";

registerSelectors();

const field1 = {
  name: "field1",
  type: "ANNOTATION_GROUP",
  options: {
    items: [
      {
        name: "rectangle",
        type: "RECTANGLE"
      },
      {
        name: "point_group",
        type: "POINT_GROUP",
        options: {
          items: [
            { name: "point1", type: "POINT", color: "color1" },
            { name: "point2", type: "POINT", color: "color2" }
          ]
        }
      }
    ]
  }
};
const field2 = { name: "field2" };
const fields1 = [field1, field2];
const annotationTemplate1 = {
  name: "annotationTemplate1",
  labels: fields1,
  type: "RECTANGLE"
};
const annotationTemplate2 = {
  name: "annotationTemplate2",
  labels: [],
  type: "POINT"
};
const templateOptions1 = { annotationPaneWidth: 0.8 };
const templateAnnotations1 = [annotationTemplate1, annotationTemplate2];
const templateContents1 = {
  options: templateOptions1,
  annotations: templateAnnotations1
};
const template1 = { id: 1, template: templateContents1 };
const annotationBoundaries1 = {
  left: 123,
  top: 162,
  right: 339,
  bottom: 432,
  type: "RECTANGLE"
};
const annotationBoundaries1JSON = annotationBoundaries1;
const annotationLabels1 = {
  rectangle: { top: 0, bottom: 0, left: 0, right: 0 },
  point_group: [
    { id: "point1", x: 0, y: 0 },
    { id: "point2", itemOption: "foo" }
  ]
};
const annotationLabels1JSON = annotationLabels1;
const annotation1 = {
  id: 1,
  boundaries: annotationBoundaries1,
  labels: annotationLabels1,
  labelsName: "annotationTemplate1",
  status: Annotation.STATUS.DONE
};
const annotation1JSON = {
  id: 1,
  boundaries: annotationBoundaries1JSON,
  labels: annotationLabels1JSON,
  labelsName: "annotationTemplate1",
  status: Annotation.STATUS.DONE
};
const annotation2 = {
  id: 2,
  boundaries: annotationBoundaries1,
  labels: annotationLabels1,
  labelsName: "annotationTemplate2",
  status: Annotation.STATUS.NOT_DONE
};
const annotation2JSON = {
  id: 2,
  boundaries: annotationBoundaries1JSON,
  labels: annotationLabels1JSON,
  labelsName: "annotationTemplate2",
  status: Annotation.STATUS.NOT_DONE
};
const annotation3 = {
  id: 3,
  boundaries: annotationBoundaries1,
  labels: annotationLabels1,
  labelsName: "annotationTemplate1",
  status: Annotation.STATUS.DONE
};
const annotation3JSON = {
  id: 3,
  boundaries: annotationBoundaries1JSON,
  labels: annotationLabels1JSON,
  labelsName: "annotationTemplate1",
  status: Annotation.STATUS.DONE
};
const annotation4 = {
  id: 4,
  boundaries: annotationBoundaries1,
  labels: annotationLabels1,
  labelsName: "annotationTemplate1"
};
const annotation4JSON = {
  id: 4,
  boundaries: annotationBoundaries1JSON,
  labels: annotationLabels1JSON,
  labelsName: "annotationTemplate1"
};
const annotation5 = {
  id: 5,
  boundaries: annotationBoundaries1,
  labels: annotationLabels1,
  labelsName: "annotationTemplate100"
};
const annotation5JSON = {
  id: 5,
  boundaries: annotationBoundaries1JSON,
  labels: annotationLabels1JSON,
  labelsName: "annotationTemplate100"
};

const annotations = {
  1: annotation1JSON,
  2: annotation2JSON,
  3: annotation3JSON,
  4: annotation4JSON,
  5: annotation5JSON
};

const image1 = {
  id: 1,
  annotations: [{ id: 1 }, { id: 2 }],
  status: IMAGE_STATUS_DONE
};

const image2 = {
  id: 2,
  annotations: [{ id: 2 }, { id: 3 }, { id: 4 }],
  status: IMAGE_STATUS_ONGOING
};

const image3 = {
  id: 3,
  annotations: [{ id: 2 }, { id: 100 }],
  status: IMAGE_STATUS_ONGOING
};

const image4 = {
  id: 4,
  annotations: [{ id: 1 }, { id: 3 }],
  status: IMAGE_STATUS_DONE
};

const imageList = [image1, image2, image3, image4];

const taskAssignment = {
  id: 100,
  project: { id: 1, name: "project_1" },
  task: { id: 10, name: "task_10", taskTemplate: template1 },
  taskItems: [image1, image2, image3, image4]
};

describe("folderTemplate", () => {
  it("should return folderTemplate if found", () => {
    const state = {
      taskAssignment: { data: taskAssignment }
    };
    const select = selector(state).select;
    const result = folderTemplate(state, select);

    expect(result).toEqual(templateContents1);
  });

  it("should return {} if not found", () => {
    const state = {
      taskAssignment: {
        data: null
      }
    };
    const select = selector(state).select;

    const result = folderTemplate(state, select);

    expect(result).toEqual({});
  });
});

describe("folderTemplateOptions", () => {
  it("should return folderTemplateOptions if found", () => {
    const state = {
      taskAssignment: { data: taskAssignment }
    };
    const select = selector(state).select;
    const result = folderTemplateOptions(state, select);

    expect(result).toEqual(templateOptions1);
  });

  it("should return {} if not found", () => {
    const state = {
      taskAssignment: {
        data: null
      }
    };
    const select = selector(state).select;

    const result = folderTemplateOptions(state, select);

    expect(result).toEqual({});
  });
});

describe("folderTemplateShownMetadataFields", () => {
  const taskAssignment = {
    data: {
      task: {
        taskTemplate: {
          template: {
            options: {
              showMetadataFields: [
                "a",
                ["a", "fooLabel"],
                "c.e.f",
                ["c.e.f", "cefLabel"],
                "notexisting",
                ["c.d.not.existing.nested", "notExistingLabel"],
                [],
                ["c.d"],
                ["array.only.label.not.existing"],
                [["arraypath"]], // corner case mistaken path use
                [{ objectpath: "asdf" }], // corner case mistaken path use
                ["b", ["arraylabel"]], // corner case mistaken label use
                ["b", { objectlabel: "asdf" }], // corner case mistaken label use
                "c" // corner case mistaken use value is object
              ]
            }
          }
        }
      }
    }
  };
  it("should return parsed folderTemplateShownMetadataFields", () => {
    const state = {
      selectedImageId: 1,
      imageList: [
        {
          id: 1,
          externalMetadata: {
            a: "foo",
            b: "bar",
            c: { d: 123, e: { f: "fizz", g: "buzz" } }
          }
        }
      ],
      taskAssignment
    };
    const select = selector(state).select;
    const result = folderTemplateShownMetadataFields(state, select);

    expect(result).toEqual([
      ["a", "foo"],
      ["fooLabel", "foo"],
      ["c.e.f", "fizz"],
      ["cefLabel", "fizz"],
      ["notexisting", undefined],
      ["notExistingLabel", undefined],
      ["c.d", "123"],
      ["array.only.label.not.existing", undefined],
      ["arraypath", undefined],
      ["[object Object]", undefined],
      ["arraylabel", "bar"],
      ["[object Object]", "bar"],
      ["c", "[object Object]"]
    ]);
  });

  it("should return undefined values if not externalMetadata found", () => {
    const state = {
      selectedImageId: 1,
      imageList: [
        {
          id: 1
        }
      ],
      taskAssignment
    };
    const select = selector(state).select;

    const result = folderTemplateShownMetadataFields(state, select);

    expect(result).toEqual([
      ["a", undefined],
      ["fooLabel", undefined],
      ["c.e.f", undefined],
      ["cefLabel", undefined],
      ["notexisting", undefined],
      ["notExistingLabel", undefined],
      ["c.d", undefined],
      ["array.only.label.not.existing", undefined],
      ["arraypath", undefined],
      ["[object Object]", undefined],
      ["arraylabel", undefined],
      ["[object Object]", undefined],
      ["c", undefined]
    ]);
  });

  it("should return [] values if not showMetadataFields option found", () => {
    const state = {
      selectedImageId: 1,
      imageList: [
        {
          id: 1,
          externalMetadata: {
            a: "foo",
            b: "bar",
            c: { d: 123, e: { f: "fizz", g: "buzz" } }
          }
        }
      ],
      taskAssignment: {
        data: {
          task: {
            taskTemplate: {
              template: {
                options: {}
              }
            }
          }
        }
      }
    };
    const select = selector(state).select;

    const result = folderTemplateShownMetadataFields(state, select);

    expect(result).toEqual([]);
  });
});

describe("folderTemplateAnnotations", () => {
  it("should return folderTemplateAnnotations if found", () => {
    const state = {
      taskAssignment: { data: taskAssignment }
    };
    const select = selector(state).select;
    const result = folderTemplateAnnotations(state, select);

    expect(result).toEqual(templateAnnotations1);
  });

  it("should return [] if not found", () => {
    const state = {
      taskAssignment: {
        data: null
      }
    };
    const select = selector(state).select;

    const result = folderTemplateAnnotations(state, select);

    expect(result).toEqual([]);
  });
});

describe("annotation", () => {
  it("should return selected annotation if found", () => {
    const state = {
      annotations,
      selectedAnnotationId: 1
    };
    const select = selector(state).select;
    const result = annotation(state, select);

    expect(result).toEqual(annotation1);
  });

  it("should return annotation if found when passing id", () => {
    const state = {
      annotations,
      selectedAnnotationId: 1
    };
    const select = selector(state).select;
    const result = annotation(state, select, 2);

    expect(result).toEqual(annotation2);
  });

  it("should return null if not found", () => {
    const state = {
      annotations,
      selectedAnnotationId: 100
    };
    const select = selector(state).select;

    const result = annotation(state, select);

    expect(result).toBeNull();
  });
});

describe("annotationTemplate", () => {
  it("should return selected annotationTemplate if found", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      selectedAnnotationId: 1
    };
    const select = selector(state).select;
    const result = annotationTemplate(state, select);

    expect(result).toEqual(annotationTemplate1);
  });

  it("should return annotationTemplate if found when passing id", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      selectedAnnotationId: 1
    };
    const select = selector(state).select;
    const result = annotationTemplate(state, select, 2);

    expect(result).toEqual(annotationTemplate2);
  });

  it("should return {} if annotation not found", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      selectedAnnotationId: 100
    };
    const select = selector(state).select;

    const result = annotationTemplate(state, select);

    expect(result).toEqual({});
  });

  it("should return {} if annotationTemplate not found", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      selectedAnnotationId: 5
    };
    const select = selector(state).select;

    const result = annotationTemplate(state, select);

    expect(result).toEqual({});
  });
});

describe("annotationFields", () => {
  it("should return selected annotationFields if found", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      selectedAnnotationId: 1
    };
    const select = selector(state).select;
    const result = annotationFields(state, select);

    expect(result).toEqual(fields1);
  });

  it("should return annotationFields if found when passing id", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      selectedAnnotationId: 2
    };
    const select = selector(state).select;
    const result = annotationFields(state, select, 1);

    expect(result).toEqual(fields1);
  });

  it("should return [] if annotationTemplate not found", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      selectedAnnotationId: 100
    };
    const select = selector(state).select;

    const result = annotationFields(state, select);

    expect(result).toEqual([]);
  });
});

describe("newAnnotationType", () => {
  it("should return newAnnotationType when found", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      selectedAnnotationId: 1,
      addAnnotation: "annotationTemplate2"
    };

    const select = selector(state).select;

    const result = newAnnotationType(state, select);

    expect(result).toEqual(annotationTemplate2);
  });

  it("should return null when annotationTemplate not found", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      selectedAnnotationId: 1,
      addAnnotation: "annotationTemplate100"
    };

    const select = selector(state).select;

    const result = newAnnotationType(state, select);

    expect(result).toBeNull();
  });
});

describe("annotationValues", () => {
  it("should return selected annotationValues if found", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      selectedAnnotationId: 1
    };
    const select = selector(state).select;
    const result = annotationValues(state, select);

    expect(result).toEqual(annotationLabels1);
  });

  it("should return {} if annotation not found", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      selectedAnnotationId: 100
    };
    const select = selector(state).select;
    const result = annotationValues(state, select);

    expect(result).toEqual({});
  });
});

describe("annotationBoundaries", () => {
  it("should return selected annotationBoundaries if found", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      selectedAnnotationId: 1
    };
    const select = selector(state).select;
    const result = annotationBoundaries(state, select);

    expect(result).toEqual(annotationBoundaries1);
  });

  it("should return {} if annotation not found", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      selectedAnnotationId: 100
    };
    const select = selector(state).select;
    const result = annotationBoundaries(state, select);

    expect(result).toEqual({});
  });
});

describe("annotationDone", () => {
  it("should return true if found", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      selectedAnnotationId: 1
    };
    const select = selector(state).select;
    const result = annotationDone(state, select);

    expect(result).toBe(true);
  });

  it("should return false if annotation not done", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      selectedAnnotationId: 2
    };
    const select = selector(state).select;
    const result = annotationDone(state, select);

    expect(result).toBe(false);
  });

  it("should return false if annotation not found", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      selectedAnnotationId: 100
    };
    const select = selector(state).select;
    const result = annotationDone(state, select);

    expect(result).toBe(false);
  });
});

describe("image", () => {
  it("should return selected image if found", () => {
    const state = {
      imageList,
      selectedImageId: 1
    };
    const select = selector(state).select;
    const result = image(state, select);

    expect(result).toEqual(image1);
  });

  it("should return null if image not found", () => {
    const state = {
      imageList,
      selectedImageId: 100
    };
    const select = selector(state).select;
    const result = image(state, select);

    expect(result).toBeNull();
  });
});

describe("imageUri", () => {
  it("should return the imageUri if image found", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      imageList,
      selectedImageId: 1
    };
    const select = selector(state).select;
    const result = imageUri(state, select);

    expect(result).toMatch("/api/projects/1/tasks/10/taskItems/1/binary");
  });

  it("should return null if image not found", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      imageList,
      selectedImageId: 100
    };
    const select = selector(state).select;
    const result = imageUri(state, select);

    expect(result).toBeNull();
  });
});

describe("imageDone", () => {
  it("should return true if found", () => {
    const state = {
      imageList,
      selectedImageId: 1
    };
    const select = selector(state).select;
    const result = imageDone(state, select);

    expect(result).toBe(true);
  });

  it("should return false if annotation not done", () => {
    const state = {
      imageList,
      selectedImageId: 2
    };
    const select = selector(state).select;
    const result = imageDone(state, select);

    expect(result).toBe(false);
  });

  it("should return false if annotation not found", () => {
    const state = {
      imageList,
      selectedImageId: 100
    };
    const select = selector(state).select;
    const result = imageDone(state, select);

    expect(result).toBe(false);
  });
});

describe("imageAnnotations", () => {
  it("should return imageAnnotations for selected image", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      imageList,
      selectedImageId: 2
    };
    const select = selector(state).select;
    const result = imageAnnotations(state, select);

    expect(result).toMatchObject([annotation2, annotation3, annotation4]);
  });

  it("should return [] if image not found", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      imageList,
      selectedImageId: 100
    };
    const select = selector(state).select;
    const result = imageAnnotations(state, select);

    expect(result).toEqual([]);
  });

  it("should return imageAnnotations for id", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      imageList,
      selectedImageId: 2
    };
    const select = selector(state).select;
    const result = imageAnnotations(state, select, 1);

    expect(result).toMatchObject([annotation1, annotation2]);
  });

  it("should skip missing annotations", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      imageList,
      selectedImageId: 3
    };
    const select = selector(state).select;
    const result = imageAnnotations(state, select);

    expect(result).toMatchObject([annotation2]);
  });
});

describe("annotationLabelFocus", () => {
  it("should return false when no fields", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      selectedAnnotationId: 5,
      lastAction: null
    };
    const select = selector(state).select;
    const result = annotationLabelFocus(state, select);

    expect(result).toBe(false);
  });

  it("should return false when lastAction is null", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      selectedAnnotationId: 1,
      lastAction: null
    };
    const select = selector(state).select;
    const result = annotationLabelFocus(state, select);

    expect(result).toBe(false);
  });

  // ACTION_CREATE_ANNOTATION

  it("should return true when ACTION_CREATE_ANNOTATION and OPTION_FOCUS", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      selectedAnnotationId: 1,
      lastAction: ACTION_CREATE_ANNOTATION,
      options: {
        onCreate: OPTION_FOCUS
      }
    };
    const select = selector(state).select;
    const result = annotationLabelFocus(state, select);

    expect(result).toBe(true);
  });

  it("should return true when ACTION_CREATE_ANNOTATION and OPTION_POPUP_FOCUS", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      selectedAnnotationId: 1,
      lastAction: ACTION_CREATE_ANNOTATION,
      options: {
        onCreate: OPTION_POPUP_FOCUS
      }
    };
    const select = selector(state).select;
    const result = annotationLabelFocus(state, select);

    expect(result).toBe(true);
  });

  it("should return false when ACTION_CREATE_ANNOTATION and not [OPTION_FOCUS, OPTION_POPUP_FOCUS]", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      selectedAnnotationId: 1,
      lastAction: ACTION_CREATE_ANNOTATION,
      options: {
        onCreate: OPTION_NOOP
      }
    };
    const select = selector(state).select;
    const result = annotationLabelFocus(state, select);

    expect(result).toBe(false);
  });
});

describe("annotationLabelPopup", () => {
  it("should return false when no fields", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      selectedAnnotationId: 5,
      lastAction: null
    };
    const select = selector(state).select;
    const result = annotationLabelPopup(state, select);

    expect(result).toBe(false);
  });

  it("should return false when lastAction is null", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      selectedAnnotationId: 1,
      lastAction: null
    };
    const select = selector(state).select;
    const result = annotationLabelPopup(state, select);

    expect(result).toBe(false);
  });

  // ACTION_CREATE_ANNOTATION

  it("should return true when ACTION_CREATE_ANNOTATION and OPTION_POPUP_FOCUS", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      selectedAnnotationId: 1,
      lastAction: ACTION_CREATE_ANNOTATION,
      options: {
        onCreate: OPTION_POPUP_FOCUS
      }
    };
    const select = selector(state).select;
    const result = annotationLabelPopup(state, select);

    expect(result).toBe(true);
  });

  it("should return false when ACTION_CREATE_ANNOTATION and not OPTION_POPUP_FOCUS", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      selectedAnnotationId: 1,
      lastAction: ACTION_CREATE_ANNOTATION,
      options: {
        onCreate: OPTION_NOOP
      }
    };
    const select = selector(state).select;
    const result = annotationLabelPopup(state, select);

    expect(result).toBe(false);
  });
});

describe("doneImages", () => {
  it("should return doneImages", () => {
    const state = {
      imageList
    };
    const select = selector(state).select;
    const result = doneImages(state, select);

    expect(result).toEqual([image1, image4]);
  });

  it("should return doneImages for given imageList", () => {
    const state = {};
    const select = selector(state).select;
    const result = doneImages(state, select, imageList);

    expect(result).toEqual([image1, image4]);
  });
});

describe("annotationFieldAnnotations", () => {
  it("should return annotationFieldAnnotations", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      annotations,
      selectedAnnotationId: 1,
      imageList,
      selectedImageId: 1
    };
    const select = selector(state).select;
    const result = annotationFieldAnnotations(state, select);
    const expected = [
      {
        hasAnnotation: true,
        id: "1@@rectangle",
        label: undefined,
        properties: {
          height: 0,
          style: { strokeColor: undefined },
          width: 0,
          x: 0,
          y: 0
        },
        type: "RECTANGLE"
      },
      {
        hasAnnotation: true,
        id: "1@@point_group@@point1",
        label: undefined,
        properties: {
          position: { x: 0, y: 0 },
          style: { strokeColor: "color1" }
        },
        type: "POINT"
      },
      {
        id: "1@@point_group@@point2",
        label: undefined,
        itemOption: "foo",
        properties: {
          style: { strokeColor: "color2" }
        },
        type: "POINT"
      }
    ];

    expect(result).toEqual(expected);
  });
});

describe("firstOngoingImageAnnotationId", () => {
  it("should return the id of the first ongoing annotation for the current image", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      imageList,
      selectedImageId: 1,
      annotations
    };
    const select = selector(state).select;
    const result = firstOngoingImageAnnotationId(state, select);

    expect(result).toEqual(annotation2.id);
  });

  it("should return the id of the first ongoing annotation for the given image id", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      imageList,
      selectedImageId: 100,
      annotations
    };
    const select = selector(state).select;
    const result = firstOngoingImageAnnotationId(state, select, 1);

    expect(result).toEqual(annotation2.id);
  });

  it("should return the id of the first annotation when all complete", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      imageList,
      selectedImageId: 4,
      annotations
    };
    const select = selector(state).select;
    const result = firstOngoingImageAnnotationId(state, select);

    expect(result).toEqual(image4.annotations[0].id);
  });

  it("should return null if no imageAnnotations", () => {
    const state = {
      taskAssignment: { data: taskAssignment },
      imageList,
      selectedImageId: 100,
      annotations
    };
    const select = selector(state).select;
    const result = firstOngoingImageAnnotationId(state, select);

    expect(result).toBeNull();
  });
});

describe("firstOngoingImageId", () => {
  it("should return the id for the first ongoing image", () => {
    const state = {
      imageList
    };
    const select = selector(state).select;
    const result = firstOngoingImageId(state, select);

    expect(result).toEqual(image2.id);
  });

  it("should return the id for the first ongoing image for the given imageList", () => {
    const state = {};
    const select = selector(state).select;
    const result = firstOngoingImageId(state, select, imageList);

    expect(result).toEqual(image2.id);
  });

  it("should return the id for the first image if not onging images", () => {
    const state = {
      imageList: [image1, image4]
    };
    const select = selector(state).select;
    const result = firstOngoingImageId(state, select);

    expect(result).toEqual(image1.id);
  });

  it("should return null if no images", () => {
    const state = {
      imageList: []
    };
    const select = selector(state).select;
    const result = firstOngoingImageId(state, select);

    expect(result).toBeNull();
  });
});
