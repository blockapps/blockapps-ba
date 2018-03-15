import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import App from './components/App/';
import EnsureAuthenticated from './components/EnsureAuthenticated/';
import Login from "./scenes/Login";
import Projects from './scenes/Projects/';
import Project from './scenes/Projects/components/Project'
import ProjectCreate from './scenes/Projects/components/ProjectCreate'


// export default (
//   <Route path="/" component={ App }>
//     <Route path="/login" component={ Login } />
//     <IndexRedirect to="/projects" />
//     <Route component={EnsureAuthenticated}>
//       <Route path="/projects" name="My Projects" icon="playlist_add_check">
//         <IndexRoute component={ Projects } />
//         <Route path="create" component={ ProjectCreate } />
//         <Route path=":pname" component={ Project } />
//       </Route>
//     </Route>
//   </Route>
// );

export default (
  <Switch>
    <Route path="/" component={ Login } />
  </Switch>
);

// export const routes = (
//   <Switch>
//     <Route exact path="/" component={App}>
//       <Redirect to="/apps" />
//     </Route>
//     <Route exact path="/apps" component={Applications} />
//     <ProtectedRoute exact path="/launchpad" component={LaunchPad} />
//     <ProtectedRoute exact path="/home" component={Dashboard} />
//     <ProtectedRoute exact path="/nodes" component={Nodes} />
//     <ProtectedRoute exact path="/blocks" component={Blocks} />
//     <ProtectedRoute exact path="/blocks/:block" component={BlockView} />
//     <ProtectedRoute exact path="/transactions" component={Transactions} />
//     <ProtectedRoute exact path="/transactions/:hash" component={TransactionView} />
//     <ProtectedRoute exact path="/accounts" component={Accounts} />
//     <ProtectedRoute exact path="/accounts/:name/:address" component={Account} />
//     <ProtectedRoute exact path="/contracts" component={Contracts} />
//     <ProtectedRoute exact path="/contracts/:name/query" component={ContractQuery} />
//     <ProtectedRoute exact path="/code_editor" component={CodeEditor} />
//   </Switch>
// );