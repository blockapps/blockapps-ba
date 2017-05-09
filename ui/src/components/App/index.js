import React, { Component } from 'react';
import { connect } from 'react-redux';
import Toolbar from 'react-md/lib/Toolbars';
import NavigationDrawer from 'react-md/lib/NavigationDrawers';
import FontIcon from 'react-md/lib/FontIcons';
import { Link } from 'react-router';
import './App.css';

class App extends Component {
  // get type of app bar based on login state
  getAppBar(title, navItems) {
    if(this.props.authenticated) {
      return (
        <NavigationDrawer
          navItems={ navItems }
          drawerTitle="Menu"
          mobileDrawerType={ NavigationDrawer.DrawerTypes.TEMPORARY }
          tabletDrawerType={ NavigationDrawer.DrawerTypes.PERSISTENT }
          desktopDrawerType={ NavigationDrawer.DrawerTypes.PERSISTENT }
          toolbarTitle={ title }
        >
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
          />
          {this.props.children}
        </div>
      )
    }
  }

  render() {
    const navItems = [];
    const location = this.props.location;
    const routes = this.props.routes;

    if(this.props.authenticated
      && routes
      && routes.length > 0
      && routes[0].childRoutes
      && routes[0].childRoutes.length > 0) {
      routes[0].childRoutes.forEach(function(route){
        //only add route if there is a name property
        if(!route.name) { return; }
        navItems.push({
          component: Link,
          to: route.path,
          primaryText: route.name,
          active: route.path === location.pathname,
          leftIcon: <FontIcon>{route.icon}</FontIcon>
        });
      });
    }

    return (this.getAppBar("BlockApps Marketplace", navItems));
  }
}

function mapStateToProps(state) {
  return {
    routing: state.routing,
    authenticated: state.login.authenticated
  };
}

export default connect(mapStateToProps)(App);
