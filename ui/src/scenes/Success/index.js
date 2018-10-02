import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { oauthSuccess } from './success.actions';
import jwtDecode from 'jwt-decode';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

class SaveCredentials extends Component {

  componentDidMount() {

    if (cookies.get('strato_oauth_demo_session')) {
      try {
        let decode = jwtDecode(cookies.get('strato_oauth_demo_session'));
        this.props.oauthSuccess(decode['email'], 'Supplier');
        browserHistory.replace('/');
      } catch (error) {
        browserHistory.replace('/');
      }
    } else {
      browserHistory.replace('/');
    }

  }

  render() {
    return null;
    // return ({<h1 style={{textAlign: "center"}}>Redirecting to Authentication Server</h1>})
  }

}

function mapStateToProps(state) {
  return {
    login: state.login
  };
}

export default connect(mapStateToProps, {oauthSuccess})(SaveCredentials);
