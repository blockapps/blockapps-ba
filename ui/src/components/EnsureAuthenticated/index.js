import { Component } from 'react';
import { connect } from 'react-redux';
import { resetChainID } from '../Chains/chains.actions';
import { me } from '../../scenes/Login/login.actions';
import { browserHistory } from 'react-router';

class EnsureAuthenticated extends Component {
  componentDidMount() {
    this.props.me();
    if (!this.props.authenticated) {
      browserHistory.replace('/welcome');
    }
  }

  render() {
    if (this.props.authenticated) {
      return this.props.children;
    }
    else {
      return null;
    }
  }
}

function mapStateToProps(state) {
  return {
    authenticated: state.login.authenticated,
    address: state.login.address,
    role: state.login.role
  }
}

export default connect(mapStateToProps, {
  resetChainID,
  me
})(EnsureAuthenticated);
