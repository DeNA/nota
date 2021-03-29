import React from "react";

/**
 * @param {{items: Nota.OptionItem[], itemWidth: number, value: string}} props
 */
const InputImageReview = props => {
  const { items, value, itemWidth } = props;

  const renderValue = () => {
    const item = items.find(item => item.value === value);

    return (
      <div className="selected-image-review">
        {item ? (
          <React.Fragment>
            <div className="image-image">
              <img
                src={item.imageUrl}
                alt={item.label}
                style={{ width: itemWidth }}
              />
            </div>
            <div className="image-label">{item.label}</div>
          </React.Fragment>
        ) : (
          "--"
        )}
      </div>
    );
  };

  return renderValue();
};

export default InputImageReview;
