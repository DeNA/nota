jest.mock("../../lib/binaryVis");
import { ResizeObserver, ResizeObserverEntry } from "@juggle/resize-observer";
import { act, render, screen } from "@testing-library/react";
import React from "react";
import { ALL_PRESET } from "../../constants";
import VideoControlsProvider from "./videoControls";
import VideoTimelineVisualizations from "./VideoTimelineVisualizations";

beforeEach(() => {
  window.ResizeObserver = ResizeObserver;
  window.ResizeObserverEntry = ResizeObserverEntry;
});

describe("VideoTimeLineVisualizations", () => {
  test("render nothing without data", async () => {
    let tree;
    const ALL = { id: ALL_PRESET, label: "All", vis: [] };

    act(() => {
      tree = render(
        <VideoControlsProvider>
          <VideoTimelineVisualizations
            projectId={1}
            taskId={1}
            taskItemId={1}
            timelineVis={[]}
            min={0}
            max={1}
            timelineVisPresets={[ALL]}
            selectedPreset={ALL}
            changeTimelineVisState={() => {}}
          />
        </VideoControlsProvider>
      );
    });

    expect(tree.asFragment()).toMatchSnapshot();
  });

  test("render timeline correctly", async () => {
    let tree;
    const ALL = {
      id: ALL_PRESET,
      label: "All",
      vis: ["test_timeline", "test_timeline_2", "test_timeline_not_existent"]
    };

    act(() => {
      tree = render(
        <VideoControlsProvider>
          <VideoTimelineVisualizations
            projectId={1}
            taskId={1}
            taskItemId={1}
            timelineVis={[
              {
                id: "test_timeline",
                label: "LINE_A"
              },
              {
                id: "test_timeline_2",
                color: "green"
              },
              {
                id: "test_timeline_not_existent",
                label: "LINE_C"
              }
            ]}
            min={0}
            max={1}
            timelineVisPresets={[ALL]}
            selectedPreset={ALL}
            changeTimelineVisState={() => {}}
          />
        </VideoControlsProvider>
      );
    });

    expect(tree.asFragment()).toMatchSnapshot();

    await act(async () => {});
    await screen.findByTestId("timeline-chart", {}, {});
    expect(tree.asFragment()).toMatchSnapshot();
  });

  test("render message when no matching vis", async () => {
    let tree;
    const ALL = { id: ALL_PRESET, label: "All", vis: ["LINE_C"] };

    act(() => {
      tree = render(
        <VideoControlsProvider>
          <VideoTimelineVisualizations
            projectId={1}
            taskId={1}
            taskItemId={1}
            timelineVis={[
              {
                id: "test_timeline_not_existent",
                label: "LINE_C"
              }
            ]}
            min={0}
            max={1}
            timelineVisPresets={[ALL]}
            selectedPreset={ALL}
            changeTimelineVisState={() => {}}
          />
        </VideoControlsProvider>
      );
    });

    await act(async () => {});
    expect(tree.asFragment()).toMatchSnapshot();
  });
});
