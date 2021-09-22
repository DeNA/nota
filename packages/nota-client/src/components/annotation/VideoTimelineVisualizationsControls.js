import React from "react";
import { DiscreteColorLegend } from "react-vis";

function VideoTimelineVisualizationsControls({ items, onToggleItem }) {
  const handleItemClick = function(item) {
    onToggleItem(item.id);
  };

  return (
    <div className="vis-controls">
      <DiscreteColorLegend items={items} onItemClick={handleItemClick} />
    </div>
  );
}

export default VideoTimelineVisualizationsControls;
