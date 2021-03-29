import "open-iconic/font/css/open-iconic-bootstrap.css";
import React from "react";

const Icon = ({ name }) => {
  return <span className={`oi oi-${name}`} aria-hidden />;
};

export default Icon;
