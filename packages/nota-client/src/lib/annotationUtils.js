export const annotationGroupAnnotations = (
  field,
  id,
  annotationFields = {},
  color
) => {
  const annotations = [];
  const options = field.options || {};
  const items = options.items || [];

  items.forEach(item => {
    const field = annotationFields[item.name];

    if (!field) {
      return;
    }

    switch (item.type) {
      case "RECTANGLE": {
        const { top, bottom, left, right, itemOption } = field;
        const annotation = {
          id: `${id}@@${item.name}`,
          type: "RECTANGLE",
          label: item.label,
          properties: {
            style: {
              strokeColor: color || item.color
            }
          }
        };

        if (itemOption) {
          annotation.itemOption = itemOption;
        }

        if (top != null && bottom != null && left != null && right != null) {
          annotation.hasAnnotation = true;
          annotation.properties = {
            ...annotation.properties,
            x: left,
            y: top,
            height: bottom - top,
            width: right - left
          };
        }

        if (annotation.itemOption || annotation.hasAnnotation) {
          annotations.push(annotation);
        }

        break;
      }
      case "POLYGON": {
        const { points, itemOption } = field;
        const annotation = {
          id: `${id}@@${item.name}`,
          type: "POLYGON",
          label: item.label,
          properties: {
            style: {
              strokeColor: color || item.color
            }
          }
        };

        if (itemOption) {
          annotation.itemOption = itemOption;
        }

        if (points && points.length && points.length >= 3) {
          annotation.hasAnnotation = true;
          annotation.properties = {
            ...annotation.properties,
            points
          };
        }

        if (annotation.itemOption || annotation.hasAnnotation) {
          annotations.push(annotation);
        }

        break;
      }
      case "POINT_GROUP": {
        const groupOptions = item.options || {};
        const groupItems = groupOptions.items || [];

        groupItems.forEach(groupItem => {
          const point = field.find(point => groupItem.name === point.id);

          const annotation = {
            id: `${id}@@${item.name}@@${groupItem.name}`,
            type: "POINT",
            label: groupItem.label,
            properties: {
              style: {
                strokeColor: color || groupItem.color
              }
            }
          };

          if (point && point.itemOption) {
            annotation.itemOption = point.itemOption;
          }

          if (point && point.x != null && point.y != null) {
            annotation.hasAnnotation = true;
            annotation.properties = {
              ...annotation.properties,
              position: {
                x: point.x,
                y: point.y
              }
            };
          }

          if (annotation.itemOption || annotation.hasAnnotation) {
            annotations.push(annotation);
          }
        });
        break;
      }
      default:
    }
  });

  return annotations;
};

export const parseAnnotationFields = (
  fields,
  id,
  annotationLabels = {},
  color
) => {
  return fields
    .filter(field => field.type === "ANNOTATION_GROUP")
    .reduce((annotations, field) => {
      return annotations.concat(
        annotationGroupAnnotations(field, id, annotationLabels, color)
      );
    }, []);
};

export const validateTextInputLabel = function(label, value) {
  const regExpString = label.options.regExp || ".*";
  const regExp = new RegExp(regExpString);

  return regExp.test(value);
};

export const validateSelectionValue = function(value, items = []) {
  return items.some(item => item.value === value);
};

// Same logic as server src/lib/utils.js#annotationDefaultLabels
export const annotationDefaultLabels = function(
  templateLabels,
  mediaDefaults = {}
) {
  const labels = (templateLabels || []).reduce((labels, label) => {
    if (label.type === "ANNOTATION_GROUP" && label.options) {
      (label.options.items || []).forEach(groupItem => {
        if (groupItem.type === "POINT_GROUP" && groupItem.options) {
          const pointLabels = (groupItem.options.items || []).reduce(
            (pointLabels, point) => {
              if (
                point.itemOptions &&
                point.itemOptions.default !== undefined
              ) {
                pointLabels.push({
                  id: point.name,
                  itemOption: point.itemOptions.default
                });
              }

              return pointLabels;
            },
            []
          );

          if (pointLabels.length) {
            labels[groupItem.name] = pointLabels;
          }
        } else {
          if (
            groupItem.itemOptions &&
            groupItem.itemOptions.default !== undefined
          ) {
            labels[groupItem.name] = {
              itemOption: groupItem.itemOptions.default
            };
          }
        }
      });
    } else if (
      label.type === "VIDEO_TIMESTAMP" &&
      label.options &&
      label.options.autoPopulate &&
      mediaDefaults.videoTime !== undefined
    ) {
      labels[label.name] = mediaDefaults.videoTime;
    } else {
      if (label.options && label.options.default !== undefined) {
        labels[label.name] = label.options.default;
      }
    }

    return labels;
  }, {});

  return labels;
};
