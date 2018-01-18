import React, { Component } from 'react';
import { connect } from 'react-redux';
import FontIcon from 'react-md/lib/FontIcons';
import Avatar from 'react-md/lib/Avatars';
import mixpanel from 'mixpanel-browser';

import { userLogout } from '../../../../scenes/Login/login.actions';
import { setUserMessage } from '../../../UserMessage/user-message.action';
import { userBalanceSubmit } from './user-badge.actions';
import { ROLES } from '../../../../constants';

class UserBadge extends Component {

  componentWillMount() {
    this.props.userBalanceSubmit(this.props.username);
  }

  handleLogoutClick = (e) => {
    e.stopPropagation();
    mixpanel.track('logout click');
    this.props.userLogout();
    this.props.setUserMessage('You logged out');
  };

  render() {
    const userIcon = <Avatar
      className="md-cell md-cell--3 md-avatar--color md-cell--middle"
      icon={parseInt(this.props.role, 10) === ROLES.BUYER ? <FontIcon>account_balance_wallet</FontIcon> : <FontIcon>build</FontIcon>}
    />;
    return (
      <div>
        <div className="md-grid user-balance userbadge-desk-view">
          {userIcon}
          <div className="md-cell md-cell--8 md-cell--middle">
            <span className="md-font-bold">{this.props.username}</span>
            <br />
            <span className="md-font-light">Balance: {this.props.balance}</span>
          </div>
          <div className="md-cell md-cell--1 md-text-center md-cell--middle">
            <a className="md-avatar--color" href="#" onClick={(e) => this.handleLogoutClick(e)}><FontIcon>exit_to_app</FontIcon></a>
          </div>
        </div>
        <div className="md-grid userbadge-mobile-view">
          <div className="md-cell md-cell--12 md-cell--right">
            <span className="md-font-bold" style={{ float: 'right' }}>{this.props.username}</span>
            <br />
            <span className="md-font-light" style={{ float: 'right' }}>
              Bal: {this.props.balance}
            </span>
          </div>
        </div>
      </div>
    );
  }

}

function mapStateToProps(state) {
  return {
    balance: state.balance.balance
  };
}

export default connect(mapStateToProps, { setUserMessage, userLogout, userBalanceSubmit })(UserBadge);