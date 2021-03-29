import React from "react";
import Mousetrap from "mousetrap";
import "mousetrap/plugins/global-bind/mousetrap-global-bind";

/**
 * @param {{[key: string]: string|string[]}} [bindings={}]
 * @param {{[key: string]: string|string[]}} [options={}]
 */
function hotkeys(bindings = {}, options = {}, isGlobal = false) {
  // @ts-ignore
  const mousetrap = new Mousetrap(document);
  return function(WrappedComponent) {
    return class extends React.Component {
      static displayName = `Hotkeys(${getDisplayName(WrappedComponent)})`;
      constructor(props) {
        super(props);
        const { hkbindings = {}, hkoptions = {} } = props;
        this.handlers = {};
        this.refreshBindingsAndOptions(hkbindings, hkoptions);
      }
      refreshBindingsAndOptions(hkbindings, hkoptions) {
        this.bindings = { ...bindings, ...hkbindings };
        this.options = { ...options, ...hkoptions };
        this.keys = Object.keys(this.bindings);
      }
      registerListeners() {
        const bindFunction = isGlobal ? "bindGlobal" : "bind";
        this.keys.forEach(key => {
          mousetrap[bindFunction](this.bindings[key], evt => {
            const handler = this.handlers[key];
            const response = handler && handler(evt);
            if (handler !== undefined && response === false) {
              evt.stopPropagation();
              evt.preventDefault();
            }
          });
        });
      }
      unregisterListeners() {
        this.keys.forEach(key => {
          mousetrap.unbind(this.bindings[key]);
        });
      }
      componentDidMount() {
        this.registerListeners();
      }
      componentDidUpdate(prevProps) {
        const { hkbindings = {}, hkoptions = {} } = this.props;
        const { prevHkbindings = {}, prevHkoptions = {} } = prevProps;

        if (
          JSON.stringify(hkbindings) !== JSON.stringify(prevHkbindings) ||
          JSON.stringify(hkoptions) !== JSON.stringify(prevHkoptions)
        ) {
          this.unregisterListeners();
          this.refreshBindingsAndOptions(hkbindings, hkoptions);
          this.registerListeners();
        }
      }
      componentWillUnmount() {
        this.unregisterListeners();
      }
      generateSubscribers() {
        return this.keys.reduce((subscribers, key) => {
          subscribers[key] = handler => {
            this.handlers[key] = handler;
          };
          return subscribers;
        }, {});
      }
      render() {
        const subscribers = this.generateSubscribers();
        return <WrappedComponent {...subscribers} {...this.props} />;
      }
    };
  };
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

export default hotkeys;
