import Mousetrap from "mousetrap";
import { useEffect } from "react";

// @ts-ignore
export const mousetrap = new Mousetrap(document);

const useHotkeys = function(hotkeys = []) {
  useEffect(() => {
    hotkeys.forEach(([key, callback]) => {
      mousetrap.bind(key, () => {
        typeof callback === "function" && callback();
      });
    });
    return () => {
      hotkeys.forEach(([key]) => {
        mousetrap.unbind(key);
      });
    };
  }, [hotkeys]);
};

export default useHotkeys;
