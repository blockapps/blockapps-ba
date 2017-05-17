import React, { Component } from 'react';
import { connect } from 'react-redux';
import Toolbar from 'react-md/lib/Toolbars';
import NavigationDrawer from 'react-md/lib/NavigationDrawers';
import FontIcon from 'react-md/lib/FontIcons';
import Avatar from 'react-md/lib/Avatars';
import { Link } from 'react-router';
import LoadingBar from 'react-redux-loading-bar';
import Snackbar from 'react-md/lib/Snackbars';
import { resetUserMessage, setUserMessage } from '../UserMessage/user-message.action';
import { userLogout } from '../../scenes/Login/login.actions';
import './App.css';


class App extends Component {
  userBadge = () => {
    const login = this.props.login;
    return (
      <div className="md-grid user-balance">
        <Avatar className="md-cell--3 md-avatar--color" icon={<FontIcon>account_circle</FontIcon>} />
        <div className="md-cell--8 pad-left">
          <span className="md-font-bold">{login.username}</span>
          <br />
          <span className="md-font-medium">Balance: 0.00</span>
        </div>
        <div className="md-cell md-cell--1 md-text-center">
          <a className="md-avatar--color" href="#" onClick={(e) => this.handleLogoutClick(e)}><FontIcon>exit_to_app</FontIcon></a>
        </div>
      </div>
    );
  };

  handleLogoutClick = (e) => {
    e.stopPropagation();
    this.props.userLogout();
    this.props.setUserMessage('You logged out');
  };

  // get type of app bar based on login state
  getAppBar(title, navItems) {
    if(this.props.login.authenticated) {
      return (
        <NavigationDrawer
          defaultVisible={ false }
          navItems={ navItems }
          drawerTitle="Menu"
          mobileDrawerType={ NavigationDrawer.DrawerTypes.TEMPORARY }
          tabletDrawerType={ NavigationDrawer.DrawerTypes.PERSISTENT }
          desktopDrawerType={ NavigationDrawer.DrawerTypes.PERSISTENT }
          toolbarTitle={ title }
          toolbarActions={ this.userBadge() }
        >
          <LoadingBar style={{position: 'fixed', zIndex: 15}} />
          {this.props.children}
        </NavigationDrawer>
      )
    }
    else {
      return (
        <div>
          <Toolbar
            colored
            title={ title }
            className="md-paper md-paper--2"
          />
          <LoadingBar />
          {this.props.children}
        </div>
      )
    }
  }

  render() {
    let navItems = [];
    const location = this.props.location;
    const routes = this.props.routes;

    if (
      this.props.login.authenticated
      && routes
      && routes.length > 1
      && routes[1].childRoutes
    ) {
      routes[1].childRoutes.forEach(
        route => {
          //only add route if there is a name property
          if(
            !route.name
            || (route['role-access'] && this.props.login.role !== route['role-access'])
          ) { return; }
          navItems.push({
            component: Link,
            to: route.path,
            primaryText: route.name,
            active: route.path === location.pathname,
            leftIcon: <FontIcon>{route.icon}</FontIcon>
          });
        }
      );
    }

    return (
      <section>
        {this.getAppBar("BlockApps Marketplace", navItems)}
        <Snackbar
          toasts={
            this.props.userMessage
              ? [{text: this.props.userMessage.toString(), action: 'Dismiss' }]
              : []
          }
          onDismiss={() => {this.props.resetUserMessage()}} />
      </section>
    )
  }
}

function mapStateToProps(state) {
  return {
    routing: state.routing,
    login: state.login,
    userMessage: state.userMessage,
  };
}

export default connect(mapStateToProps, {resetUserMessage, setUserMessage, userLogout})(App);
