import React from "react";

const SVGFilterBrightness = ({ brightness = 0, id }) => {
  /**
   * brightness (-5, 5) -> exponent (0.25, 3)
   * darken (-1, -5) -> (1.15, 1.75) -> 0.15 increments
   * original 0 -> 1
   * brighten (1, 5) -> (0.9, 0.5) -> 0.1 decrements
   */
  const exponent =
    brightness === 0
      ? 1
      : brightness > 0
      ? 1 - brightness * 0.1
      : 1 + Math.abs(brightness) * 0.15;

  return (
    <filter id={id}>
      <feComponentTransfer>
        <feFuncR type="gamma" exponent={exponent} />
        <feFuncG type="gamma" exponent={exponent} />
        <feFuncB type="gamma" exponent={exponent} />
      </feComponentTransfer>
    </filter>
  );
};

export default SVGFilterBrightness;
