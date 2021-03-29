import { connect } from "react-redux";
import ImageList from "../ImageList";
import { IMAGE_STATUS_DONE } from "../../../constants";
import hotkeys from "../../../lib/Hotkeys";
import { selector } from "../../../lib/selector";
import history from "../../../lib/history";

const setImageCompletionStatus = images => {
  return images.map(image => {
    const complete = image.status === IMAGE_STATUS_DONE ? true : false;
    return { ...image, complete };
  });
};

const mapStateToProps = state => {
  const db = selector(state);

  return {
    list: setImageCompletionStatus(state.imageList),
    selectedItemId: state.selectedImageId,
    selectedItemCompleted: db.select("imageDone")
  };
};

const mapDispatchToProps = dispatch => {
  return {
    selectItem: imageId => {
      history.push(`${imageId}`);
    }
  };
};

const bindings = {
  onSelectNext: "down",
  onSelectPrevious: "up"
};

const ImageListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(hotkeys(bindings)(ImageList));
export default ImageListContainer;
