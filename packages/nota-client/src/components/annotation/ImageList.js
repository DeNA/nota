import React, { Component } from "react";
import ImageListItem from "./ImageListItem";
import VirtualList from "react-tiny-virtual-list";

/**
 * @augments {Component<{
      list: object[],
      selectItem: function
    }, {}>}
 */
class ImageList extends Component {
  constructor(props) {
    const { onSelectNext, onSelectPrevious } = props;
    super(props);
    this.state = {
      internalItemId: props.selectedItemId
    };
    const selectNextId = nextId => {
      const { selectItem } = this.props;
      this.setState(
        {
          internalItemId: nextId
        },
        () => {
          setTimeout(() => {
            if (nextId === this.state.internalItemId) {
              selectItem(nextId);
            }
          }, 150);
        }
      );
    };
    onSelectNext(evt => {
      const { list } = this.props;
      const { internalItemId } = this.state;
      const nextIndex = list.findIndex(item => internalItemId === item.id) + 1;
      if (nextIndex < list.length) {
        selectNextId(list[nextIndex].id);
      }
      return false;
    });
    onSelectPrevious(evt => {
      const { list } = this.props;
      const { internalItemId } = this.state;
      const previousIndex =
        list.findIndex(item => internalItemId === item.id) - 1;
      if (previousIndex >= 0) {
        selectNextId(list[previousIndex].id);
      }
      return false;
    });
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      internalItemId: nextProps.selectedItemId
    });
  }
  render() {
    const { list, selectItem } = this.props;
    const { internalItemId } = this.state;
    const index = list.findIndex(item => item.id === internalItemId);
    return (
      <VirtualList
        width="100%"
        height={70}
        itemSize={25}
        itemCount={list.length}
        scrollToAlignment="center"
        scrollToIndex={index || 0}
        renderItem={({ index, style }) => {
          const item = list[index];
          const isSelected = item.id === internalItemId;
          return (
            <div key={item.id} style={style}>
              <ImageListItem
                {...{
                  item,
                  isComplete: item.complete,
                  selectItem,
                  isSelected,
                  position: `[${index + 1}/${list.length}] `
                }}
              />
            </div>
          );
        }}
      />
    );
  }
}

export default ImageList;
