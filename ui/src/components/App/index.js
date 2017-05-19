import React, { Component } from 'react';
import { connect } from 'react-redux';
import Toolbar from 'react-md/lib/Toolbars';
import NavigationDrawer from 'react-md/lib/NavigationDrawers';
import Button from 'react-md/lib/Buttons';
import FontIcon from 'react-md/lib/FontIcons';
import { Link } from 'react-router';
import LoadingBar from 'react-redux-loading-bar';
import Snackbar from 'react-md/lib/Snackbars';
import UserBadge from './components/UserBadge/';
import mixpanel from 'mixpanel-browser';
import { resetUserMessage } from '../UserMessage/user-message.action';
import { getExplorerUrl } from '../ExplorerUrl/explorer.actions';
import { userLogout } from '../../scenes/Login/login.actions';
import './App.css';

mixpanel.init('17bfafc2d7d8643cfe775c63898f4ced');

class App extends Component {

  componentWillMount() {
    this.props.getExplorerUrl();
  }


  // get type of app bar based on login state
  getAppBar(title, navItems) {
    if(this.props.login.authenticated) {
      mixpanel.alias(this.props.login.username); // FIXME Should only make this call once on user signup
      mixpanel.identify(this.props.login.username);
      return (
        <NavigationDrawer
          defaultVisible={ false }
          navItems={ navItems }
          drawerTitle="Menu"
          mobileDrawerType={ NavigationDrawer.DrawerTypes.TEMPORARY }
          tabletDrawerType={ NavigationDrawer.DrawerTypes.PERSISTENT }
          desktopDrawerType={ NavigationDrawer.DrawerTypes.PERSISTENT }
          toolbarTitle={ title }
          toolbarActions={ <UserBadge username={this.props.login.username} role={this.props.login.role} /> }
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
            actions={
              <Button flat
                      href={this.props.explorerUrl}
                      target="_blank"
                      label="Explorer">explore
              </Button>
            }
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
        {this.getAppBar("Supply Chain", navItems)}
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
    explorerUrl: state.explorerUrl.explorerUrl,
  };
}

export default connect(mapStateToProps, {resetUserMessage, userLogout, getExplorerUrl})(App);
