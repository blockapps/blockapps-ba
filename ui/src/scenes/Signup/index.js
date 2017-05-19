import React, { Component } from 'react';
import { connect } from 'react-redux';
import Button from 'react-md/lib/Buttons/Button';
import Paper from 'react-md/lib/Papers';
import Toolbar from 'react-md/lib/Toolbars';
import SelectField from 'react-md/lib/SelectFields';
import { reduxForm, Field } from 'redux-form';
import { userSignupSubmit } from './signup.actions';
import { browserHistory } from 'react-router';
import { USER_ROLES } from '../../constants.js'
import ReduxedTextField from '../../components/ReduxedTextField/';
import ReduxedSelectField from './components/ReduxedSelectField/';
import mixpanel from 'mixpanel-browser';
import './Signup.css';

class Signup extends Component {

  submit = (values) => {
    mixpanel.track('signup_click');
    console.log(values);
    this.props.userSignupSubmit(values.username, values.password, USER_ROLES[values.role]);
  }

  render() {
    const {
      // signup,
      handleSubmit
    } = this.props;

    const login = () => { return browserHistory.push(`/login`); }
    const roles = Object.keys(USER_ROLES).slice(2);

    return (
      <div className="md-grid md-toolbar--relative signup-margin-top">
        <div className="md-cell md-cell--4 md-cell--1-tablet md-cell--phone-hidden" />
        <div className="md-cell md-cell--4 md-cell--10-tablet md-cell--12-phone">
          <Paper className="login-paper" zDepth={3}>
            <Toolbar colored title="Signup" />
            <form onSubmit={handleSubmit(this.submit)}>
              <div className="md-grid">
                <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
                <Field
                  id="username"
                  name="username"
                  type="text"
                  label="Enter Desired Username"
                  className="md-cell md-cell--8-desktop md-cell--10-tablet md-cell--10-phone"
                  component={ReduxedTextField} />
                <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
                <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
                <Field
                  id="password"
                  name="password"
                  type="password"
                  label="Enter Password"
                  className="md-cell md-cell--8-desktop md-cell--10-tablet md-cell--10-phone"
                  component={ReduxedTextField} />
                <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
                <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
                <Field
                  id="role"
                  name="role"
                  label="Role"
                  placeholder="Select a Role"
                  menuItems={ roles }
                  itemLabel="roleName"
                  itemValue="role"
                  helpOnFocus
                  helpText="Select a Role"
                  className="md-cell md-cell--8-desktop md-cell--10-tablet md-cell--10-phone"
                  component={ReduxedSelectField}
                  />
                <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
                <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
                <div className="md-cell md-cell--8-desktop md-cell--10-tablet md-cell--10-phone md-text-right login-cell">
                  <div className="md-cell md-cell--4-desktop md-cell--5-tablet md-cell--5-phone md-text-right login-cell login-buttons">
                    <Button raised primary label="Login" onClick={login} />
                  </div>
                  <div className="md-cell md-cell--4-desktop md-cell--5-tablet md-cell--5-phone md-text-right login-cell login-buttons">
                    <Button raised secondary label="Sign Up" type="submit" />
                  </div>
                </div>
                <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
              </div>
            </form>
          </Paper>
        </div>
        <div className="md-cell md-cell--4 md-cell--1-tablet md-cell--phone-hidden" />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    signup: state.signup
  };
}

const connected = connect(mapStateToProps, { userSignupSubmit })(Signup);

const formedComponent = reduxForm({ form: 'signup'})(connected);

export default formedComponent;
