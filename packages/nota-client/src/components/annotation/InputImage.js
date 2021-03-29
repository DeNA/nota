import React from "react";

/**
 * @param {{items: Nota.OptionItem[], itemWidth: number, value: string, editable: boolean, onChange: any}} props
 */
const InputImage = props => {
  const { items, value, editable, onChange, itemWidth } = props;

  /**
   * @param {Nota.OptionItem} item
   */
  const renderItem = item => {
    const hotkey = item.hotkey && item.hotkey.length ? ` (${item.hotkey})` : "";
    const active = item.value === value;
    return (
      <div
        className={`image-button ${active ? "active" : ""}`}
        style={{ width: itemWidth }}
        key={item.value}
        onClick={() => {
          onChange(active ? undefined : item.value);
        }}
      >
        <div className="image-button-image">
          <img src={item.imageUrl} alt={item.label} />
        </div>
        <div className="image-button-label">{item.label + hotkey}</div>
      </div>
    );
  };

  const renderInput = () => (
    <div className="image-buttons">{items.map(item => renderItem(item))}</div>
  );

  const renderValue = () => {
    const item = items.find(item => item.value === value);

    return (
      <div className="selected-image" style={{ width: itemWidth }}>
        {item ? (
          <React.Fragment>
            <div className="image-button-image">
              <img src={item.imageUrl} alt={item.label} />
            </div>
            <div className="image-button-label">{item.label}</div>
          </React.Fragment>
        ) : (
          "--"
        )}
      </div>
    );
  };

  return editable ? renderInput() : renderValue();
};

export default InputImage;
