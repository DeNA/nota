import { useState } from "react";
import useInterval from "./useInterval";

const MIN_REFRESH_DELAY = 500;
const MAX_REFRESH_DELAY = 10000;

function useIntervalReload(callback, shouldReload) {
  const [delay, setDelay] = useState(MIN_REFRESH_DELAY);

  if (!shouldReload && delay > MIN_REFRESH_DELAY) {
    setDelay(MIN_REFRESH_DELAY);
  }

  useInterval(
    () => {
      setDelay(Math.min(delay * 1.5, MAX_REFRESH_DELAY));
      callback();
    },
    shouldReload ? delay : null
  );
}

export default useIntervalReload;
