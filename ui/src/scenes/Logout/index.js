import React, { Component } from 'react';
import { connect } from 'react-redux';
import { logoutRequest } from './logout.actions';

class Logout extends Component {

  componentDidMount() {
    this.props.logoutRequest();
  }

  render() {
    return (
      <h1 style={{ textAlign: "center" }}>Logout In Process</h1>
    );
  }

}

function mapStateToProps(state) {
  return {
    login: state.login
  };
}

export default connect(mapStateToProps, { logoutRequest })(Logout);
