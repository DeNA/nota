import React from "react";
import { Icon, Button } from "./semantic";
import { Modal } from "react-bootstrap";

const ImageListItem = function({
  item,
  isComplete,
  isSelected,
  selectItem,
  position
}) {
  const [showMetadata, setShowMetadata] = React.useState(false);

  return (
    <>
      <div
        className={"item" + (isSelected ? " active" : "")}
        onClick={() => selectItem(item.id)}
      >
        <div>
          <Icon name="image" />
          <div className="image-name">
            {position}
            {item.name}
            {isComplete ? " (Complete)" : ""}
          </div>
        </div>
        {item.externalMetadata && (
          <div
            className="metadata-toggle"
            title="Show metadata"
            onClick={() => setShowMetadata(true)}
          >
            <Icon name={"tag"} />
          </div>
        )}
      </div>
      <Modal show={showMetadata} onHide={() => setShowMetadata(false)}>
        <Modal.Header>Metadata for {item.name}</Modal.Header>
        <Modal.Body>
          <code style={{ whiteSpace: "pre" }}>
            {JSON.stringify(item.externalMetadata, null, 2)}
          </code>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMetadata(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ImageListItem;
