import React from "react";
import { Spinner } from "react-bootstrap";

const Loading = function({ loading = true, global = false }) {
  const style = {
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.1)",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10000
  };

  if (global) {
    style.position = "fixed";
  }

  return loading ? (
    <div
      className="d-flex justify-content-center align-items-center"
      style={style}
    >
      <Spinner animation="border" />
    </div>
  ) : null;
};

export default Loading;
