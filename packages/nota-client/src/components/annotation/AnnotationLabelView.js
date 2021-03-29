import React, { useState } from "react";
import useHotkeys from "../../lib/useHotkeys";
import AnnotationLabelListContainer from "./containers/AnnotationLabelListContainer";
import AnnotationLabelStatusContainer from "./containers/AnnotationLabelStatusContainer";
import FullscreenPopup from "./FullscreenPopup";
import { Icon } from "./semantic";

const HOTKEY = "o";

const AnnotationLabelView = function(props) {
  const [popup, setPopup] = useState(props.popup);
  const togglePopup = function(force = !popup) {
    setPopup(force);
  };

  useHotkeys([[HOTKEY, togglePopup]]);
  const metadataFields = props.metadataFields;

  const view = (
    <div className="annotation-label-view">
      <div className="annotation-label-controls">
        <div className="popup-button" onClick={() => togglePopup(true)}>
          <Icon name="external square" />
          Open popup{HOTKEY && ` (${HOTKEY})`}
        </div>
      </div>
      {metadataFields.length ? (
        <div className="annotation-image-metadata">
          {metadataFields.map(([label, value]) => (
            <div
              key={Math.random()}
              className="annotation-image-metadata-field"
            >
              {label}: {value}
            </div>
          ))}
        </div>
      ) : null}
      <AnnotationLabelListContainer />
      <AnnotationLabelStatusContainer />
    </div>
  );

  return popup ? (
    <FullscreenPopup contents={view} close={() => togglePopup(false)} />
  ) : (
    view
  );
};

export default AnnotationLabelView;
