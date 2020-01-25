import React, {Component} from 'react';
import { Route, BrowserRouter as Router, Switch, } from 'react-router-dom';
import Login from './Login';
import NotFound from './NotFound';
import './assets/css/materialize.min.css';
import './assets/css/style.css';
import Projects from './projects/Projects';
import EditProject from './projects/EditProject';
import Users from './users/Users';
import EditUser from './users/EditUser';

import Todo from './todo/Todo';
import EditTodo from './todo/EditTodo';
import TodoDetails from './todo/TodoDetails';

import AccessDenied from './AccessDenied';

class Routes extends Component {
	
  render() {
    return (
      <Router basename={'/sherin-todo/'} >
	      <Switch >
	      	<Route exact path="/" component={Login} />
	        <Route exact path="/login" component={Login} />
	        <Route exact path="/projects" component={Projects} />
	        <Route  path="/projects/add" component={EditProject} />
	        <Route  path="/projects/edit/:id" component={EditProject} />
	        <Route exact path="/users" component={Users} />
	        <Route  path="/users/add" component={EditUser} />
	        <Route  path="/users/edit/:id" component={EditUser} />
	        <Route exact path="/todo" component={Todo} />
	        <Route  path="/todo/add" component={EditTodo} />
	        <Route  path="/todo/details/:id" component={TodoDetails} />
	        <Route  path="/todo/edit/:id" component={EditTodo} />
	        <Route  path="/access-denied" component={AccessDenied} />
	        <Route component={NotFound} />
	      </Switch>
        
      </Router>
    )
  }
}

export default Routes;
