import React, { Component } from "react";
import Me from "../../Me";
import { fetchMe, changePassword } from "../../../lib/api";

class MeContainer extends Component {
  state = {
    me: null,
    message: null,
    error: null
  };
  constructor(props) {
    super(props);

    this.refreshMe();
  }
  refreshMe = async () => {
    fetchMe().then(me => this.setState({ me }));
  };
  changePassword = async me => {
    this.setState({ message: null, error: null }, async () => {
      try {
        await changePassword(me);
        this.setState({ message: "Password changed successfully" }, () => {
          this.refreshMe();
        });
      } catch (err) {
        this.setState({ error: err.message });
      }
    });
  };
  render() {
    const { me, message, error } = this.state;

    if (!me) {
      return null;
    }

    return (
      <Me
        me={me}
        message={message}
        error={error}
        changePassword={this.changePassword}
      />
    );
  }
}

export default MeContainer;
