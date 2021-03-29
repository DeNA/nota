import React, { Component } from "react";
import ImageAnnotation from "./ImageAnnotation";
import AnnotationLabelAnnotationGroupItem from "./AnnotationLabelAnnotationGroupItem";
import Mousetrap from "mousetrap";
// @ts-ignore
import background from "./background.png";

const TAB = "tab";
const SHIFT_TAB = "shift+tab";
const ESC = "escape";
const SPACE = "space";
const SHIFT = "shift";
const UP = "up";
const DOWN = "down";
const LEFT = "left";
const RIGHT = "right";
const SHIFT_UP = "shift+up";
const SHIFT_DOWN = "shift+down";
const SHIFT_LEFT = "shift+left";
const SHIFT_RIGHT = "shift+right";

const KEYCODE_MAP = {
  ArrowLeft: "left",
  ArrowUp: "up",
  ArrowRight: "right",
  ArrowDown: "down"
};

/**
 * @augments {Component<{
      label: any,
      annotationId: number|string,
      annotations: object[],
      newAnnotation: object,
      onUpdate: any,
      onDelete: any,
      onAddAnnotation: any,
      imageUri: string,
      imageFilters: object,
      options: object,
      editable: boolean,
      focus: boolean
    },{}>} 
 */
class AnnotationLabelAnnotationGroupView extends Component {
  container = null;
  mousetrap = null;
  pressedKeys = {};
  throttleTimers = {};
  templates = {};
  keys = [
    TAB,
    SHIFT_TAB,
    ESC,
    SPACE,
    UP,
    DOWN,
    LEFT,
    RIGHT,
    SHIFT_UP,
    SHIFT_DOWN,
    SHIFT_LEFT,
    SHIFT_RIGHT
  ];
  constructor(props) {
    super(props);

    this.state = {
      selectedAnnotationId: null,
      annotations: [...props.annotations],
      ids: this.generateIdsList(props.label, props.annotationId)
    };
  }
  componentDidMount() {
    this.container.addEventListener("keydown", this.handleKeydown);
    this.container.addEventListener("keyup", this.handleKeyup);
    this.mousetrap = new Mousetrap(this.container);
    this.mousetrap.bind(this.keys, this.handleKeypress);

    if (this.props.focus) {
      this.selectFirstItem();
    }
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      annotations: [...nextProps.annotations],
      ids: this.generateIdsList(nextProps.label, nextProps.annotationId)
    });
  }
  componentWillUnmount() {
    this.container.removeEventListener("keydown", this.handleKeydown);
    this.container.removeEventListener("keyup", this.handleKeyup);
    this.mousetrap.reset();
    this.mousetrap = null;
  }
  generateIdsList(items, annotationId) {
    return items.options.items.reduce((ids, group) => {
      const newIds = this.generateGroupIds(group, `${annotationId}@@`);

      return ids.concat(newIds);
    }, []);
  }
  generateGroupIds(group, prefix = "") {
    if (group.options && group.options.items && group.options.items.length) {
      return group.options.items.reduce((ids, item) => {
        const newIds = this.generateGroupIds(item, `${prefix}${group.name}@@`);

        return ids.concat(newIds);
      }, []);
    } else {
      return [{ id: `${prefix}${group.name}`, template: group }];
    }
  }
  handleKeydown = evt => {
    const key = KEYCODE_MAP[evt.key];

    if (key) {
      this.pressedKeys[key] = true;
    }
  };
  handleKeyup = evt => {
    const key = KEYCODE_MAP[evt.key];

    if (key) {
      this.pressedKeys[key] = false;
    }
  };
  handleKeypress = (evt, key) => {
    const { editable, onAddAnnotation, newAnnotation, onDelete } = this.props;
    const { annotations, ids, selectedAnnotationId } = this.state;

    switch (key) {
      case TAB:
      case SHIFT_TAB:
        evt.stopPropagation();
        evt.preventDefault();

        let index = ids.findIndex(item => item.id === selectedAnnotationId);

        if (index === -1) {
          index = 0;
        } else if (key === TAB) {
          index = (index + 1) % ids.length;
        } else {
          index = index - 1 >= 0 ? index - 1 : ids.length - 1;
          index = index % ids.length;
        }

        this.setState({ selectedAnnotationId: ids[index].id }, () => {
          const annotation = annotations.find(
            annotation => annotation.id === ids[index].id
          );
          if (!annotation || !annotation.hasAnnotation) {
            onAddAnnotation(ids[index].template, ids[index].id);
          } else {
            onAddAnnotation();
          }
        });
        break;
      case LEFT:
      case RIGHT:
      case UP:
      case DOWN:
      case SHIFT_LEFT:
      case SHIFT_RIGHT:
      case SHIFT_UP:
      case SHIFT_DOWN:
        evt.stopPropagation();
        evt.preventDefault();

        if (!editable) return;

        const annotationIndex = annotations.findIndex(
          annotation => annotation.id === selectedAnnotationId
        );

        if (annotationIndex === -1) {
          return;
        }

        const annotation = annotations[annotationIndex];
        const newAnnotations = [...annotations];

        const changed = this.calculateNewPosition(annotation, key);

        if (this.throttleTimers[annotation.id]) {
          clearTimeout(this.throttleTimers[annotation.id]);
          delete this.throttleTimers[annotation.id];
        }

        this.throttleTimers[annotation.id] = setTimeout(() => {
          this.handleUpdate(changed);
          delete this.throttleTimers[annotation.id];
        }, 500);

        newAnnotations.splice(annotationIndex, 1, changed);

        this.setState({
          annotations: newAnnotations
        });
        break;
      case ESC:
        evt.stopPropagation();
        evt.preventDefault();

        this.setState({ selectedAnnotationId: null }, () => {
          onAddAnnotation();
          this.container.blur();
        });
        break;
      case SPACE:
        if (selectedAnnotationId) {
          evt.stopPropagation();
          evt.preventDefault();
        }

        if (!editable) return;

        const item = ids.find(item => item.id === selectedAnnotationId);

        if (annotations.find(annotation => annotation.id === item.id)) {
          onDelete(selectedAnnotationId);
        } else if (newAnnotation) {
          onAddAnnotation();
        } else if (item) {
          onAddAnnotation(item.template, selectedAnnotationId);
        }

        break;
      default:
    }
  };
  selectFirstItem = () => {
    const { onAddAnnotation } = this.props;
    const { ids, annotations } = this.state;

    if (!ids || !ids.length) {
      return;
    }

    const item = ids[0];

    this.container.focus();

    this.setState({ selectedAnnotationId: item.id }, () => {
      const annotation = annotations.find(
        annotation => annotation.id === item.id
      );
      if (!annotation || !annotation.hasAnnotation) {
        onAddAnnotation(item.template, item.id);
      } else {
        onAddAnnotation();
      }
    });
  };
  calculateNewPosition = (annotation, key) => {
    const newProperties = {};

    if (annotation.type === "POINT") {
      newProperties.position = { ...annotation.properties.position };

      if (key.includes(UP) || this.pressedKeys[UP]) {
        newProperties.position.y = annotation.properties.position.y - 2;
      }
      if (key.includes(DOWN) || this.pressedKeys[DOWN]) {
        newProperties.position.y = annotation.properties.position.y + 2;
      }
      if (key.includes(LEFT) || this.pressedKeys[LEFT]) {
        newProperties.position.x = annotation.properties.position.x - 2;
      }
      if (key.includes(RIGHT) || this.pressedKeys[RIGHT]) {
        newProperties.position.x = annotation.properties.position.x + 2;
      }
    } else if (annotation.type === "RECTANGLE") {
      if (key.includes(UP) || this.pressedKeys[UP]) {
        if (key.includes(SHIFT)) {
          newProperties.height = annotation.properties.height - 2;
        } else {
          newProperties.y = annotation.properties.y - 2;
        }
      }
      if (key.includes(DOWN) || this.pressedKeys[DOWN]) {
        if (key.includes(SHIFT)) {
          newProperties.height = annotation.properties.height + 2;
        } else {
          newProperties.y = annotation.properties.y + 2;
        }
      }
      if (key.includes(LEFT) || this.pressedKeys[LEFT]) {
        if (key.includes(SHIFT)) {
          newProperties.width = annotation.properties.width - 2;
        } else {
          newProperties.x = annotation.properties.x - 2;
        }
      }
      if (key.includes(RIGHT) || this.pressedKeys[RIGHT]) {
        if (key.includes(SHIFT)) {
          newProperties.width = annotation.properties.width + 2;
        } else {
          newProperties.x = annotation.properties.x + 2;
        }
      }
    } else {
      return annotation;
    }

    return {
      ...annotation,
      properties: { ...annotation.properties, ...newProperties }
    };
  };
  handleSelected = selected => {
    const { onAddAnnotation } = this.props;
    const { ids, annotations } = this.state;
    const selectedAnnotationId = selected ? selected.id || selected : null;

    this.setState({ selectedAnnotationId }, () => {
      const item = ids.find(item => item.id === selectedAnnotationId);
      const annotation = annotations.find(
        annotation => annotation.id === item.id
      );

      if (!annotation || !annotation.hasAnnotation) {
        onAddAnnotation(item.template, item.id);
      } else {
        onAddAnnotation();
      }
      this.container.focus();
    });
  };
  handleUpdate = changed => {
    const { onUpdate } = this.props;

    onUpdate(changed);
  };
  handleChangeItemOption = (id, value) => {
    const { onUpdate } = this.props;

    onUpdate({ id, itemOption: value }, true);
  };
  renderControlGroupItem(item, prefix = "") {
    const {
      annotationId,
      newAnnotation,
      onDelete,
      onAddAnnotation,
      editable
    } = this.props;
    const { annotations, selectedAnnotationId } = this.state;
    const id = `${annotationId}@@${prefix}${item.name}`;
    const annotation = annotations.find(annotation => annotation.id === id);
    const isCreating = newAnnotation && newAnnotation.id === id;

    return (
      <AnnotationLabelAnnotationGroupItem
        annotation={annotation}
        id={id}
        item={item}
        editable={editable}
        isCreating={isCreating}
        isSelected={selectedAnnotationId === id}
        key={id}
        onAddAnnotation={onAddAnnotation}
        onDeleteAnnotation={onDelete}
        onSelectedAnnotation={this.handleSelected}
        itemOptions={item.itemOptions}
        onChangeItemOption={this.handleChangeItemOption}
      />
    );
  }
  renderControlGroupItems(group) {
    switch (group.type) {
      case "RECTANGLE":
      case "POLYGON":
        return this.renderControlGroupItem(group);
      case "POINT_GROUP":
        return group.options.items.map(point => {
          return this.renderControlGroupItem(point, `${group.name}@@`);
        });
      default:
        return null;
    }
  }
  renderControls() {
    const { label, annotationId } = this.props;

    return (
      <div className="annotation-groups">
        {label.options.items.map(group => {
          return (
            <div
              className="annotation-group"
              key={`${annotationId}@@${group.name}`}
            >
              <div className="annotation-group-label">{group.label}</div>
              <div className="annotation-group-items">
                {this.renderControlGroupItems(group)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  renderContents() {
    const { imageUri, newAnnotation, imageFilters, options } = this.props;
    const { annotations, selectedAnnotationId } = this.state;
    const showableAnnotations = annotations.filter(
      annotation => annotation.hasAnnotation
    );

    return (
      <div
        className="annotation-label-group"
        tabIndex={0}
        ref={container => (this.container = container)}
      >
        <div
          className="image"
          style={{
            background: `url(${background})`
          }}
        >
          <ImageAnnotation
            image={imageUri}
            imageBrightness={imageFilters.brightness || 0}
            outsideCanvas={0}
            showLabels="hover"
            annotations={showableAnnotations}
            controlled
            strokeWidth={1}
            selectedAnnotationStrokeWidth={2.5}
            minScale={options.minScale}
            maxScale={options.maxScale}
            maxScaleClick={options.maxScaleClick}
            zoomSensibility={options.zoomSensibility}
            selectedAnnotation={selectedAnnotationId}
            annotationChanged={this.handleUpdate}
            annotationCreated={this.handleUpdate}
            annotationSelected={this.handleSelected}
            draw={newAnnotation}
          />
        </div>
        <div className="annotation-controls">{this.renderControls()}</div>
      </div>
    );
  }
  render() {
    return this.renderContents();
  }
}

export default AnnotationLabelAnnotationGroupView;
