import { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import jwtDecode from 'jwt-decode';
import { userLoginSuccess } from '../Login/login.actions';
import { getOauthCookie, getRoleCookie } from '../../lib/cookie';
import { ROLES } from '../../constants';

class SaveCredentials extends Component {

  componentDidMount() {
    const oauthCookie = getOauthCookie();
    const userRoleCookie = getRoleCookie();

    if (oauthCookie) {
      try {
        let decode = jwtDecode(oauthCookie);
        // TODO: change ROLES.BUYER when you manage user as per the roles (create user)
        this.props.userLoginSuccess(decode['email'], parseInt(userRoleCookie));
        browserHistory.replace('/');
      } catch (error) {
        // TODO: redirect to Login page if no cookies are present on browser side (EX: oauthRedirectRequest)
        browserHistory.replace('/');
      }
    } else {
      browserHistory.replace('/');
    }
  }

  render() {
    return null;
  }

}

function mapStateToProps(state) {
  return {
    login: state.login
  };
}

export default connect(mapStateToProps, { userLoginSuccess })(SaveCredentials);
