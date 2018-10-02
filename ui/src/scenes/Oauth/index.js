import React, { Component } from 'react';
import { connect } from 'react-redux';
import { oauthRedirectRequest } from './oauth.actions';

class Oauth extends Component {

  componentDidMount() {
    this.props.oauthRedirectRequest();
  }

  render() {
    return (
      <h1 style={{textAlign: "center"}}>Redirecting to Authentication Server</h1>
    );
  }

}

function mapStateToProps(state) {
  return {
    login: state.login
  };
}

export default connect(mapStateToProps, {oauthRedirectRequest})(Oauth);
