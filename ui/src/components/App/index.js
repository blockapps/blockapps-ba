import React, { Component } from 'react';
import { connect } from 'react-redux';
import Toolbar from 'react-md/lib/Toolbars';
import NavigationDrawer from 'react-md/lib/NavigationDrawers';
import FontIcon from 'react-md/lib/FontIcons';
import { Link } from 'react-router';
import LoadingBar from 'react-redux-loading-bar';
import Snackbar from 'react-md/lib/Snackbars';
import { resetUserMessage } from '../UserMessage/user-message.action';
import UserBadge from './components/UserBadge/';

import './App.css';

class App extends Component {

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
          toolbarActions={ <UserBadge username={this.props.login.username} /> }
        >
          <LoadingBar style={{position: 'relative', zIndex: 20}} />
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

export default connect(mapStateToProps, {resetUserMessage})(App);
