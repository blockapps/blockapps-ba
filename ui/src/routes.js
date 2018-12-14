import React from 'react';
import { Route, IndexRedirect, IndexRoute } from 'react-router';
import App from './components/App/';
import EnsureAuthenticated from './components/EnsureAuthenticated/';
import Projects from './scenes/Projects/';
import Project from './scenes/Projects/components/Project'
import ProjectCreate from './scenes/Projects/components/ProjectCreate';
import Welcome from './scenes/Welcome';
import CreateChain from './scenes/Welcome/components/CreateChain';

export default (
  <Route path="/" component={App}>
    <IndexRedirect to="/welcome" />
    <Route path="/welcome" component={Welcome} />
      <Route path="/create-chain" component={CreateChain} />
    <Route component={EnsureAuthenticated}>
      <Route path="/projects" name="My Projects" icon="playlist_add_check">
        <IndexRoute component={Projects} />
        <Route path="create" component={ProjectCreate} />
        <Route path=":pname" component={Project} />
      </Route>
    </Route>
  </Route>
);
