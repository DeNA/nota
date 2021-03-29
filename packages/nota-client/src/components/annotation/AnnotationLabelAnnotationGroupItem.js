import React, { Component } from "react";
import { Button } from "./semantic";
import SingleSelectionDropdown from "./InputDropdown";

/**
 * @augments {Component<{
      annotation: object,
      id: string,
      item: object,
      isCreating: boolean,
      isSelected: boolean,
      editable: boolean,
      onAddAnnotation: any,
      onDeleteAnnotation: any,
      onSelectedAnnotation: any,
      itemOptions: any[],
      onChangeItemOption: any
    },{}>} 
 */
class AnnotationLabelAnnotationGroupItem extends Component {
  container = null;
  renderControls() {
    const {
      annotation,
      id,
      isCreating,
      onDeleteAnnotation,
      onSelectedAnnotation,
      onAddAnnotation,
      editable
    } = this.props;

    if (annotation && annotation.hasAnnotation) {
      return (
        <div className="controls">
          <Button
            type="button"
            size="mini"
            color="red"
            inverted
            compact
            disabled={!editable}
            className="delete"
            icon="minus"
            onClick={() => onDeleteAnnotation(id)}
            tabIndex={-1}
          />
        </div>
      );
    } else {
      return (
        <div className="controls">
          {isCreating ? (
            <Button
              type="button"
              className="cancel"
              size="mini"
              color="grey"
              inverted
              compact
              disabled={!editable}
              icon="minus"
              onClick={() => onAddAnnotation()}
              tabIndex={-1}
            />
          ) : (
            <Button
              type="button"
              className="add"
              size="mini"
              color="green"
              compact
              disabled={!editable}
              icon="plus"
              onClick={() => onSelectedAnnotation(id)}
              tabIndex={-1}
            />
          )}
        </div>
      );
    }
  }
  handleSelected = evt => {
    const { id, onSelectedAnnotation } = this.props;

    evt.stopPropagation();
    evt.preventDefault();

    onSelectedAnnotation(id);
  };
  handleChangedItemOption = value => {
    const { id, onChangeItemOption } = this.props;

    onChangeItemOption(id, value);
  };
  render() {
    const { annotation, item, isSelected, itemOptions, editable } = this.props;
    const colorStyle = item.color
      ? {
          backgroundColor: item.color
        }
      : {};

    return (
      <div
        className={`annotation-group-item ${isSelected ? "selected" : ""}`}
        ref={container => (this.container = container)}
      >
        {this.renderControls()}
        <div className="color" style={colorStyle} />
        <div className="label" onClick={this.handleSelected}>
          {item.label}
        </div>
        <div className="itemOptions">
          {itemOptions && (
            <SingleSelectionDropdown
              items={itemOptions.items}
              value={
                annotation && annotation.itemOption
                  ? annotation.itemOption
                  : itemOptions.items[0].value
              }
              editable={editable}
              onChange={this.handleChangedItemOption}
              ignoreFocus
            />
          )}
        </div>
      </div>
    );
  }
}

export default AnnotationLabelAnnotationGroupItem;
