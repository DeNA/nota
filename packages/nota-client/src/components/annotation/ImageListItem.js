import React from "react";
import { Icon, Button } from "./semantic";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const ImageListItem = function({
  item,
  isComplete,
  isSelected,
  selectItem,
  position
}) {
  const { t } = useTranslation();
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
            {isComplete ? ` ${t("complete-2")}` : ""}
          </div>
        </div>
        {item.externalMetadata && (
          <div
            className="metadata-toggle"
            title={t("show-metadata")}
            onClick={() => setShowMetadata(true)}
          >
            <Icon name={"tag"} />
          </div>
        )}
      </div>
      <Modal show={showMetadata} onHide={() => setShowMetadata(false)}>
        <Modal.Header>{t("metadata-title", { item })}</Modal.Header>
        <Modal.Body>
          <code style={{ whiteSpace: "pre" }}>
            {JSON.stringify(item.externalMetadata, null, 2)}
          </code>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMetadata(false)}>
            {t("close-button")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ImageListItem;
