import React, { Component } from 'react';
import { connect } from 'react-redux';
import Toolbar from 'react-md/lib/Toolbars';
import NavigationDrawer from 'react-md/lib/NavigationDrawers';
import FontIcon from 'react-md/lib/FontIcons';
import Avatar from 'react-md/lib/Avatars';
import { Link } from 'react-router';
import './App.css';

const userBadge = (login) => {
  return (
    <div className="md-grid user-balance">
      <Avatar className="md-cell--3 md-avatar--color" icon={<FontIcon>account_circle</FontIcon>} />
      <div className="md-cell--8 pad-left">
        <span className="md-font-bold">{login.username}</span>
        <br />
        <span className="md-font-medium">Balance: 0.00</span>
      </div>
    </div>
  );
}



class App extends Component {
  // get type of app bar based on login state
  getAppBar(title, navItems) {
    if(this.props.login.authenticated) {
      return (
        <NavigationDrawer
          navItems={ navItems }
          drawerTitle="Menu"
          mobileDrawerType={ NavigationDrawer.DrawerTypes.TEMPORARY }
          tabletDrawerType={ NavigationDrawer.DrawerTypes.PERSISTENT }
          desktopDrawerType={ NavigationDrawer.DrawerTypes.PERSISTENT }
          toolbarTitle={ title }
          toolbarActions={ userBadge(this.props.login) }
        >
          <div className="md-grid">
            <div className="md-cell md-cell--12">
              <div className="md-grid" />
              {this.props.children}
            </div>
          </div>
        </NavigationDrawer>
      )
    }
    else {
      return (
        <div>
          <Toolbar
            colored
            title={ title }
          />
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

    return (this.getAppBar("BlockApps Marketplace", navItems));
  }
}

function mapStateToProps(state) {
  return {
    routing: state.routing,
    login: state.login
  };
}

export default connect(mapStateToProps)(App);
