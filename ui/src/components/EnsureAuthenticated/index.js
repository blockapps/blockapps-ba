import { Component } from 'react';
import { connect } from 'react-redux';
import { hashHistory } from 'react-router';

class EnsureAuthenticated extends Component {
  componentDidMount() {
    if(!this.props.authenticated) {
      hashHistory.replace('/login');
    }
  }

  render() {
    if(this.props.authenticated) {
      return this.props.children;
    }
    else {
      return null;
    }
  }
}

function mapStateToProps(state) {
  return {
    authenticated: state.login.authenticated
  }
}

export default connect(mapStateToProps)(EnsureAuthenticated);
