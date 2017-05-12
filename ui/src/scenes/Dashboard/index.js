import React, { Component } from 'react';
import { Link } from 'react-router';

class Dashboard extends Component {
  render() {
    return (
      <div className="md-grid">
        <div className="md-cell--10">
          <h3>Dashboard</h3>
        </div>
        <div className="md-cell--2">
          <Link to="/dashboard/bid">Bid because you can!</Link>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default Dashboard;
