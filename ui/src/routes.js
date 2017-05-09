import React from 'react';
import { Route, IndexRedirect } from 'react-router';
import App from './components/App/';

import EnsureAuthenticated from './components/EnsureAuthenticated/';
import Login from "./scenes/Login";
import Dashboard from './scenes/Dashboard/';
import Projects from './scenes/Projects/';
import Reports from './scenes/Reports/';
import Settings from './scenes/Settings/';

export default (
  <Route path="/" component={ App }>
    <Route path="/login" component={ Login } />
    <IndexRedirect to="/dashboard" />
    <Route component={EnsureAuthenticated}>
      <Route path="/dashboard" component={ Dashboard } name="Dashboard" icon="home" />
      <Route path="/projects" component={ Projects } name="Projects" icon="view_list" />
      <Route path="/reports" component={ Reports } name="Reports" icon="trending_up" />
      <Route path="/settings" component={ Settings } name="Settings" icon="settings" />
    </Route>
  </Route>
);
