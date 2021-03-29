import React from "react";
import { Button } from "../semantic";

class RetryErrorContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error(error, info);
  }
  render() {
    const { message = "Something went wrong" } = this.props;
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: "center" }}>
          <h3>{message}</h3>
          <Button onClick={() => this.setState({ hasError: false })}>
            Retry
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default RetryErrorContainer;
