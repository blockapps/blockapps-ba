import { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import jwtDecode from 'jwt-decode';
import { userLoginSuccess } from '../../scenes/Login/login.actions';
import { getOauthCookie } from '../../lib/cookie';
import { ROLES } from '../../constants';

class EnsureAuthenticated extends Component {

  componentWillMount() {
    const oauthCookie = getOauthCookie();

    if (oauthCookie) {
      let decode = jwtDecode(oauthCookie);
      // TODO: change ROLES.BUYER when you manage user as per the roles (create user)
      this.props.userLoginSuccess(decode['email'], ROLES.BUYER);
    } else {
      browserHistory.replace('/oauth');
    }
  }

  render() {
    if (getOauthCookie()) {
      return this.props.children;
    } else {
      return null;
    }
  }
}

function mapStateToProps(state) {
  return {
    login: state.login
  }
}

export default connect(mapStateToProps, { userLoginSuccess })(EnsureAuthenticated);
