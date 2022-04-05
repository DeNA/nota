import React from "react";
import { DiscreteColorLegend } from "react-vis";

function VideoTimelineVisualizationsControls({
  items,
  onToggleItem,
  selectedPresetId,
  presets,
  onChangePreset
}) {
  const handleItemClick = function(item) {
    onToggleItem(item.id);
  };
  const handlePresetChange = function(evt) {
    onChangePreset(evt.target.value);
  };

  return (
    <div className="vis-controls">
      <select onChange={handlePresetChange} value={selectedPresetId}>
        {presets.map(preset => (
          <option key={preset.id} value={preset.id} disabled={preset.disabled}>
            {preset.label}
          </option>
        ))}
      </select>
      <DiscreteColorLegend items={items} onItemClick={handleItemClick} />
    </div>
  );
}

export default VideoTimelineVisualizationsControls;
