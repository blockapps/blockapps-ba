import { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { resetChainID } from '../Chains/chains.actions';

class EnsureAuthenticated extends Component {
  componentDidMount() {
    if (!this.props.authenticated) {
      browserHistory.replace('/login');
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
    role: state.login.role
  }
}

export default connect(mapStateToProps, {
  resetChainID
})(EnsureAuthenticated);
