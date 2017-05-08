import React from 'react';
import { Route, IndexRedirect, IndexRoute } from 'react-router';
import App from './components/App/';

import Dashboard from './scenes/Dashboard/';
import Projects from './scenes/Projects/';
import Reports from './scenes/Reports/';
import Settings from './scenes/Settings/';

export default (
  <Route path="/" component={ App }>
    <IndexRedirect to="/dashboard" />
    <Route path="/dashboard" name="Dashboard" icon="home">
      <IndexRoute component={ Dashboard } />
    </Route>
    <Route path="/projects" component={ Projects } name="Projects" icon="view_list" />
    <Route path="/reports" component={ Reports } name="Reports" icon="trending_up" />
    <Route path="/settings" component={ Settings } name="Settings" icon="settings" />
  </Route>
);
