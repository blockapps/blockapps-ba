import React from 'react';
import { Route, IndexRedirect, IndexRoute } from 'react-router';
import App from './components/App/';
import EnsureAuthenticated from './components/EnsureAuthenticated/';
import Login from "./scenes/Login";
import Projects from './scenes/Projects/';
import OpenProjects from './scenes/OpenProjects/';
import Project from './scenes/Projects/components/Project'
import ProjectCreate from './scenes/Projects/components/ProjectCreate'
import Bid from './scenes/Projects/components/Bid/';


export default (
  <Route path="/" component={ App }>
    <Route path="/login" component={ Login } />
    <IndexRedirect to="/projects" />
    {/*<Route component={EnsureAuthenticated}>*/}
      <Route path="/projects" name="My Projects" icon="playlist_add_check">
        <IndexRoute component={ Projects } />
        <Route path="create" component={ ProjectCreate } />
        <Route path=":pname" component={ Project } />
        <Route path=":name/bid" component={ Bid } />
      </Route>
      <Route path="/open-projects" component={ OpenProjects } name="Open Projects" icon="view_list" role-access="SUPPLIER"/>
    {/*</Route>*/}
  </Route>
);
