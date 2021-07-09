import React from "react";
import { MEDIA_TYPE } from "../../constants";
import AnnotationListContainer from "./containers/AnnotationListContainer";
import ImageContainer from "./containers/ImageContainer";
import ImageControlsContainer from "./containers/ImageControlsContainer";
import ImageListContainer from "./containers/ImageListContainer";
import ProjectMenuContainer from "./containers/ProjectMenuContainer";
import VideoContainer from "./containers/VideoContainer";
import RetryErrorContainer from "./containers/RetryErrorContainer";
// @ts-ignore
import background from "./background.png";
import { Segment } from "./semantic";
import { useTranslation } from "react-i18next";

const AnnotatePreview = ({ mediaType }) => {
  const { t } = useTranslation();
  const MediaContainer =
    mediaType === MEDIA_TYPE.IMAGE
      ? ImageContainer
      : mediaType === MEDIA_TYPE.VIDEO
      ? VideoContainer
      : () => "UNSUPORTED MEDIA TYPE";
  return (
    <div className="Preview">
      <div className="top">
        <div className="menu">
          <ProjectMenuContainer />
        </div>
        <Segment className="image-list">
          <ImageListContainer />
        </Segment>
      </div>
      <div className="image-controls-container">
        <ImageControlsContainer />
      </div>
      <Segment
        className="current-image"
        style={{
          background: `url(${background})`
        }}
      >
        <RetryErrorContainer message={t("load-media-error")}>
          <MediaContainer />
        </RetryErrorContainer>
      </Segment>
      <Segment className="image-annotations">
        <AnnotationListContainer />
      </Segment>
    </div>
  );
};

export default AnnotatePreview;
