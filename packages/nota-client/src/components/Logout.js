import React, { Component } from "react";
import { Redirect } from "react-router";
import { logout } from "../lib/auth";

class Logout extends Component {
  state = {
    finished: false
  };
  async componentDidMount() {
    await logout();
    this.setState({ finished: true });
  }
  render() {
    const { finished } = this.state;

    return finished ? <Redirect to="/login" /> : null;
  }
}

export default Logout;
