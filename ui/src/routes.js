import React from 'react';
import { Route, IndexRedirect, IndexRoute } from 'react-router';
import App from './components/App/';
import EnsureAuthenticated from './components/EnsureAuthenticated/';
import Login from "./scenes/Login/";
import Dashboard from './scenes/Dashboard/';
import Projects from './scenes/Projects/';
import Project from './scenes/Projects/components/Project'
import ProjectCreate from './scenes/Projects/components/ProjectCreate'
import Reports from './scenes/Reports/';
import Settings from './scenes/Settings/';
import Bid from './scenes/Dashboard/components/Bid/';


export default (
  <Route path="/" component={ App }>
    <Route path="/login" component={ Login } />
    <IndexRedirect to="/dashboard" />
    <Route component={EnsureAuthenticated}>
      <Route path="/dashboard" component={ Dashboard } name="Dashboard" icon="home">
        <Route path="/dashboard/bid" component={ Bid } />
      </Route>
      <Route path="/projects" name="Projects" icon="view_list">
        <IndexRoute component={ Projects } />
        <Route path="create" component={ ProjectCreate } />
        <Route path=":pid" component={ Project } />
      </Route>
      <Route path="/reports" component={ Reports } name="Reports" icon="trending_up" />
      <Route path="/settings" component={ Settings } name="Settings" icon="settings" />
  </Route>
);
