import React, { Component } from 'react';
import { connect } from 'react-redux';
import NavigationDrawer from 'react-md/lib/NavigationDrawers';
import FontIcon from 'react-md/lib/FontIcons';
import { Link } from 'react-router';
import './App.css';

class App extends Component {

  render() {
    const navItems = [];
    const location = this.props.location;
    const routes = this.props.routes;
    if(routes
      && routes.length > 0
      && routes[0].childRoutes
      && routes[0].childRoutes.length > 0) {
      routes[0].childRoutes.forEach(function(route){
        navItems.push({
          component: Link,
          to: route.path,
          primaryText: route.name,
          active: route.path === location.pathname,
          leftIcon: <FontIcon>{route.icon}</FontIcon>
        });
      });
    }

    return (
      <NavigationDrawer
        navItems={navItems}
        drawerTitle="Menu"
        mobileDrawerType={NavigationDrawer.DrawerTypes.TEMPORARY}
        tabletDrawerType={NavigationDrawer.DrawerTypes.PERSISTENT}
        desktopDrawerType={NavigationDrawer.DrawerTypes.PERSISTENT}
        toolbarTitle="BlockApps Marketplace"
      >
        {this.props.children}
      </NavigationDrawer>
    );
  }
}

function mapStateToProps(state) {
  return {
    routing: state.routing
  };
}

export default connect(mapStateToProps)(App);
