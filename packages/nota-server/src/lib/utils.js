const compareIds = function(a, b) {
  return a.id - b.id;
};

const compareByKey = function(key) {
  return function(a, b) {
    return a[key].localeCompare(b[key]);
  };
};

// Same logic as client/src/lib/annotationUtils.js#annotationDefaultLabels
const annotationDefaultLabels = function(templateLabels) {
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
    } else {
      if (label.options && label.options.default !== undefined) {
        labels[label.name] = label.options.default;
      }
    }

    return labels;
  }, {});

  return labels;
};

const sleep = async function(ms) {
  return new Promise(resolve => {
    setTimeout(() => resolve(true), ms);
  });
};

module.exports = { compareIds, compareByKey, annotationDefaultLabels, sleep };
