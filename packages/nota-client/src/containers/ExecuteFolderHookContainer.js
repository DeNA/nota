import React from "react";
import { executeFolderHook } from "../lib/api";
import { Modal, Loader, Button } from "../components/annotation/semantic";

function withFolderHook(WrappedComponent) {
  return class extends React.Component {
    static displayName = `FolderHook(${getDisplayName(WrappedComponent)})`;
    state = {
      message: null,
      busy: false
    };
    executeFolderHook = async (folderId, hook, callback) => {
      this.setState({ busy: true }, async () => {
        try {
          const response = await executeFolderHook(folderId, hook);
          callback && callback(true);
          this.setState({ busy: false, message: response.message });
        } catch (error) {
          this.setState({
            busy: false,
            message: "Error happened. Check console for details"
          });
          callback && callback(false);
          console.error(error);
        }
      });
    };
    render() {
      const { message, busy } = this.state;

      return (
        <>
          <Modal
            open={busy || !!message}
            closeOnEscape={false}
            closeOnDimmerClick={false}
            closeIcon={false}
          >
            {message ? (
              <>
                <Modal.Content>
                  {message.split("\n").map((p, i) => (
                    <div key={p + i}>{p}</div>
                  ))}
                </Modal.Content>
                <Modal.Actions>
                  <Button onClick={() => this.setState({ message: null })}>
                    Close
                  </Button>
                </Modal.Actions>
              </>
            ) : (
              <Loader />
            )}
          </Modal>
          <WrappedComponent
            executeFolderHook={this.executeFolderHook}
            {...this.props}
          />
        </>
      );
    }
  };
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

export default withFolderHook;
