import React, { Component } from 'react';
import { connect } from 'react-redux';
import Button from 'react-md/lib/Buttons/Button';
import Paper from 'react-md/lib/Papers';
import Toolbar from 'react-md/lib/Toolbars';
import { reduxForm, Field } from 'redux-form';
import { userLoginSubmit } from './login.actions';
import ReduxedTextField from '../../components/ReduxedTextField/';
import './Login.css';

class Login extends Component {

  submit = (values) => {
    this.props.userLoginSubmit(values.username, values.password);
  }

  render() {
    const {
      // login,
      handleSubmit
    } = this.props;

    return (
      <div className="md-grid md-toolbar--relative">
        <div className="md-cell--4 md-cell--phone-hidden" />
        <div className="md-cell--4 md-cell--12-phone">
          <Paper className="login-paper" zDepth={5}>
            <Toolbar colored title="Login" />
            <form onSubmit={handleSubmit(this.submit)}>
              <div className="md-grid">
                <div className="md-cell--12">
                  <div className="md-grid md-grid--no-spacing">
                    <div className="md-cell--2" />
                    <Field
                      id="username"
                      name="username"
                      type="text"
                      label="Enter Username"
                      className="md-cell--8 md-cell--top"
                      component={ReduxedTextField} />
                    <div className="md-cell--2" />
                  </div>
                </div>
                <div className="md-cell--12">
                  <div className="md-grid md-grid--no-spacing">
                    <div className="md-cell--2" />
                    <Field
                      id="password"
                      name="password"
                      type="password"
                      label="Enter Password"
                      className="md-cell--8 md-cell--bottom"
                      component={ReduxedTextField} />
                    <div className="md-cell--2" />
                  </div>
                </div>
                <div className="md-cell--12" />
                <div className="md-cell--right login-cell">
                  <Button className="md-cell--right" raised primary label="Login" type="submit" />
                </div>
                <div className="md-cell--3" />
              </div>
            </form>
          </Paper>
        </div>
        <div className="md-cell--4 md-cell--phone-hidden" />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    login: state.login
  };
}

const connected = connect(mapStateToProps, { userLoginSubmit })(Login);

const formedComponent = reduxForm({ form: 'login'})(connected);

export default formedComponent;
