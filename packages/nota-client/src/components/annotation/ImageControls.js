import React, { useContext } from "react";
import { Dropdown } from "./semantic";
import { DEFAULT_ANNOTATION_COLOR } from "../../constants";
import Icon from "../Icon";
import { videoControlsContext } from "./videoControls";
import { useTranslation } from "react-i18next";

const ImageControls = function({
  annotationTemplates,
  addAnnotation,
  toggleAddAnnotation,
  createAnnotation,
  onClearAnnotations,
  imageId,
  editable,
  done,
  hasAnnotations,
  ...props
}) {
  const { t } = useTranslation();
  const {
    videoControls: { getTime }
  } = useContext(videoControlsContext);
  const handleConfirmClear = function() {
    onClearAnnotations(imageId);
  };
  const handleAddAnnotationChange = function(templateName) {
    const template = annotationTemplates.find(
      template => template.name === templateName
    );

    if (template && template.type === "MEDIA_LABELS") {
      return createAnnotation(imageId, templateName, { videoTime: getTime() });
    }

    if (templateName === false || addAnnotation === templateName) {
      toggleAddAnnotation(false);
    } else {
      toggleAddAnnotation(templateName);
    }
  };
  const renderNewAnnotationButtons = function() {
    return annotationTemplates
      .filter(template => !template.options || !template.options.autoCreate)
      .map(template => {
        const label =
          template.label + (template.hotkey ? ` (${template.hotkey})` : "");
        const color =
          template.options && template.options.color
            ? template.options.color
            : DEFAULT_ANNOTATION_COLOR;

        template.hotkey &&
          props[`hk_addAnnotation_${template.name}`] &&
          props[`hk_addAnnotation_${template.name}`](() =>
            handleAddAnnotationChange(template.name)
          );

        const active = addAnnotation === template.name;

        return (
          <div
            key={template.name}
            className={`item ${active ? "active" : ""}`}
            style={{ borderColor: active ? color : "rgba(0,0,0,0)" }}
            onClick={evt =>
              handleAddAnnotationChange(
                addAnnotation === template.name ? false : template.name
              )
            }
          >
            <span className="color" style={{ background: color }} />
            <span className="name">{label}</span>
          </div>
        );
      });
  };
  return (
    <div className="image-controls">
      <div className="add-icon">
        <Icon name="grid-four-up" />
      </div>
      <div className="toggle-add-annotation">
        {imageId !== null
          ? !editable || done
            ? ""
            : renderNewAnnotationButtons()
          : ""}
      </div>
      <div className="delete-button">
        {imageId !== null && hasAnnotations ? (
          !editable || done ? (
            ""
          ) : (
            <Dropdown title="Actions" icon="setting" pointing="top right">
              <Dropdown.Menu>
                <Dropdown.Item onClick={handleConfirmClear}>
                  <div>{t("reset-annotations")}</div>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default ImageControls;
