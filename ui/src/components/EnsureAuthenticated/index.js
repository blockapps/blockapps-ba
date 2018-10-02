import { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import Cookies from 'universal-cookie';
const cookies = new Cookies();

class EnsureAuthenticated extends Component {
  componentWillMount() {
    console.log(this.props.login);
    if (cookies.get('strato_oauth_demo_session')) {
      //TODO: get email id from jwt if it's not expired
    } else {
      browserHistory.replace('/oauth');
    }
  }

  render() {
    if (cookies.get('strato_oauth_demo_session')) {
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

export default connect(mapStateToProps)(EnsureAuthenticated);
