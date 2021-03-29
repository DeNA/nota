import { fireEvent } from "@testing-library/react";
import { mousetrap } from "../../lib/useHotkeys";
import React, { useContext, useEffect } from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import AnnotationLabelVideoTimestamp from "./AnnotationLabelVideoTimestamp";
import VideoControlsProvider, { videoControlsContext } from "./videoControls";

describe("AnnotationLabelVideoTimestamp", () => {
  /** @type HTMLDivElement */
  let container;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  const setup = function({
    label = {},
    options = {},
    value,
    editable = true
  } = {}) {
    const video = {
      current: {
        pause: jest.fn(),
        play: jest.fn(),
        currentTime: 3,
        duration: 10
      }
    };
    const VideoSetter = function() {
      const { setVideo } = useContext(videoControlsContext);

      useEffect(() => setVideo([video, 25]), []);
      return null;
    };
    const onChange = jest.fn();

    act(() => {
      ReactDOM.render(
        <VideoControlsProvider>
          <VideoSetter />
          <AnnotationLabelVideoTimestamp
            label={{
              type: "VIDEO_TIMESTAMP",
              name: "test",
              label: "Test",
              options: {
                required: true,
                description: "Test description",
                manuallyEditable: true,
                ...options
              },
              ...label
            }}
            value={value}
            editable={editable}
            onChange={onChange}
          />
        </VideoControlsProvider>,
        container
      );
    });
    return {
      video,
      onChange
    };
  };

  it("renders without time, editable", () => {
    const { video, onChange } = setup({ value: undefined, editable: true });

    expect(container.querySelector(".time-value-input").value).toBe("");
    expect(container.querySelector(".time-value-input").disabled).toBe(false);
  });
  it("renders without time, review", () => {
    const { video, onChange } = setup({ value: undefined, editable: false });

    expect(container.querySelector(".time-value-read-only").innerHTML).toBe(
      "--"
    );
  });
  it("renders with time, editable", () => {
    const { video, onChange } = setup({ value: 321, editable: true });

    expect(container.querySelector(".time-value-input").value).toBe("321");
  });
  it("input should be disabled when editable but manuallyEditable is false", () => {
    const { video, onChange } = setup({
      value: 321,
      editable: true,
      options: { manuallyEditable: false }
    });

    expect(container.querySelector(".time-value-input").disabled).toBe(true);
  });
  it("renders with time, review", () => {
    const { video, onChange } = setup({ value: 321, editable: false });

    expect(container.querySelector(".time-value-read-only").innerHTML).toBe(
      "321 ms"
    );
  });
  it("should set time when button is clicked", () => {
    const { video, onChange } = setup({ value: undefined, editable: true });
    video.current.currentTime = 1;

    expect(container.querySelector(".time-value-input").value).toBe("");

    act(() => {
      container
        .querySelector(".button-set-time")
        .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(video.current.pause).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(1000);
  });
  it("should not be able to set time when review", () => {
    const { video, onChange } = setup({ value: undefined, editable: false });

    expect(container.querySelector(".button-set-time")).toBeNull();
  });
  it("should clear time when button is clicked", () => {
    const { video, onChange } = setup({ value: 321, editable: true });

    expect(container.querySelector(".time-value-input").value).toBe("321");

    act(() => {
      container
        .querySelector(".button-clear-time")
        .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith();
  });
  it("should not be able to clear time when review", () => {
    const { video, onChange } = setup({ value: 321, editable: false });

    expect(container.querySelector(".button-clear-time")).toBeNull();
  });
  it("should go to time when button is clicked", () => {
    const { video, onChange } = setup({ value: 5000, editable: true });

    act(() => {
      container
        .querySelector(".button-go-to-time")
        .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onChange).toHaveBeenCalledTimes(0);
    expect(video.current.currentTime).toBe(5);
  });
  it("should go to time when button is clicked, review", () => {
    const { video, onChange } = setup({ value: 4000, editable: true });

    act(() => {
      container
        .querySelector(".button-go-to-time")
        .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onChange).toHaveBeenCalledTimes(0);
    expect(video.current.currentTime).toBe(4);
  });
  it("should set time when hotkey is pressed", () => {
    const { video, onChange } = setup({
      value: 1500,
      editable: true,
      label: { hotkey: "m" }
    });
    video.current.currentTime = 3;

    expect(container.querySelector(".time-value-input").value).toBe("1500");

    act(() => {
      mousetrap.trigger("m");
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(video.current.pause).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(3000);
  });
  it("should not set time when hotkey is pressed, review", () => {
    const { video, onChange } = setup({
      value: 1500,
      editable: false,
      label: { hotkey: "m" }
    });
    video.current.currentTime = 3;

    expect(container.querySelector(".time-value-read-only").innerHTML).toBe(
      "1500 ms"
    );
    act(() => {
      mousetrap.trigger("m");
    });

    expect(onChange).toHaveBeenCalledTimes(0);
    expect(container.querySelector(".time-value-read-only").innerHTML).toBe(
      "1500 ms"
    );
  });
  it("should set time when direct input", () => {
    const { video, onChange } = setup({
      value: 1500,
      editable: true
    });

    const input = container.querySelector(".time-value-input");
    expect(input.value).toBe("1500");

    fireEvent.change(input, { target: { value: "2000" } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(2000);
  });
  it("should ignore invalid values when direct input", () => {
    const { video, onChange } = setup({
      value: 1500,
      editable: true
    });

    const input = container.querySelector(".time-value-input");
    expect(input.value).toBe("1500");

    fireEvent.change(input, { target: { value: "foobar" } });

    expect(onChange).toHaveBeenCalledTimes(0);
    expect(input.value).toBe("1500");
  });
});
