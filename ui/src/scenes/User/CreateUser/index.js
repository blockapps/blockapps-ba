import React, { Component } from 'react';
import { connect } from 'react-redux';
import Button from 'react-md/lib/Buttons/Button';
import Paper from 'react-md/lib/Papers';
import Card from 'react-md/lib/Cards/Card';
import CardTitle from 'react-md/lib/Cards/CardTitle';
import { reduxForm, Field } from 'redux-form';
import ReduxedTextField from '../../../components/ReduxedTextField';
import ReduxedSelectField from '../../../components/ReduxedSelectField';
import Media, { MediaOverlay } from 'react-md/lib/Media';
import mixpanel from 'mixpanel-browser';
import { fetchChains } from '../../../components/Chains/chains.actions';
import { fetchAccounts, fetchUserAddresses } from '../../../components/Accounts/accounts.actions';
import { browserHistory } from 'react-router';
import { createUserRequest } from '../user.actions';

class CreateUser extends Component {

  componentDidMount() {
    this.props.fetchChains();
    this.props.fetchAccounts();
  }

  onUsernameChange = (e, value) => {
    this.props.fetchUserAddresses(value);
  }

  navigateToLogin = () => {
    browserHistory.push('/login');
  }

  submit = (values) => {
    mixpanel.track('create_user_click');
    this.props.createUserRequest(values)
    this.props.reset();
  }

  render() {
    const {
      handleSubmit
    } = this.props;

    return (
      <div className="md-grid md-toolbar--relative login-margin-top">
        <div className="md-cell md-cell--3-desktop md-cell--2-tablet md-cell--phone-hidden" />
        <div className="md-cell md-cell--6-desktop md-cell--8-tablet md-cell--12-phone">
          <Card>
            <Media>
              <img src="img/supply-chain.jpeg" alt="Login splash" />
              <MediaOverlay>
                <CardTitle title="Blockchain Enabled SCM" >
                </CardTitle>
              </MediaOverlay>
            </Media>
            <Paper className="login-paper" zDepth={3}>
              <form onSubmit={handleSubmit(this.submit)}>
                <div className="md-grid">
                  <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
                  <Field
                    id="chainId"
                    name="chainId"
                    type="select"
                    label="Select Chain"
                    menuItems={this.props.chains}
                    className="md-cell md-cell--8-desktop md-cell--10-tablet md-cell--10-phone"
                    component={ReduxedSelectField}
                  />
                  <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
                  <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
                  <Field
                    id="username"
                    name="username"
                    type="select"
                    menuItems={this.props.accounts}
                    onChange={this.onUsernameChange}
                    label="Username"
                    className="md-cell md-cell--8-desktop md-cell--10-tablet md-cell--10-phone"
                    component={ReduxedSelectField}
                  />
                  <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
                  <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
                  <Field
                    id="address"
                    name="address"
                    type="select"
                    menuItems={this.props.accountAddresses}
                    label="Address"
                    className="md-cell md-cell--8-desktop md-cell--10-tablet md-cell--10-phone"
                    component={ReduxedSelectField}
                  />
                  <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
                  <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    label="Password"
                    className="md-cell md-cell--8-desktop md-cell--10-tablet md-cell--10-phone"
                    component={ReduxedTextField}
                  />
                  <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
                  <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
                  <Field
                    id="role"
                    name="role"
                    type="select"
                    label="Select Role"
                    menuItems={["SUPPLIER", "BUYER"]}
                    className="md-cell md-cell--8-desktop md-cell--10-tablet md-cell--10-phone"
                    component={ReduxedSelectField}
                  />
                  <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
                  <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
                  <div className="md-cell md-cell--4-desktop md-cell--5-tablet md-cell--10-phone md-text-right login-cell">
                    <Button flat secondary label="Login" type="button" onClick={this.navigateToLogin} style={{ marginLeft: '10px' }} />
                  </div>
                  <div className="md-cell md-cell--4-desktop md-cell--5-tablet md-cell--10-phone login-cell">
                    <Button raised primary label="Create User" type="submit" disabled={this.props.isLoading} />
                  </div>
                </div>
              </form>
            </Paper>
          </Card>
        </div>
      </div>
    );
  }
}

function validate(values) {
  let errors = {};

  if (!values.username) {
    errors.username = "required"
  }

  if (!values.address) {
    errors.address = "required"
  }

  if (!values.password) {
    errors.password = "required"
  }

  if (!values.chainId) {
    errors.chainId = "required"
  }

  if (!values.role) {
    errors.role = "required"
  }

  return errors;
}

function mapStateToProps(state) {
  return {
    chains: state.chains.chainIds,
    accounts: state.account.accounts,
    accountAddresses: state.account.accountAddresses,
    isLoading: state.user.isLoading
  };
}

const connected = connect(mapStateToProps, { fetchChains, fetchAccounts, fetchUserAddresses, createUserRequest })(CreateUser);

const formedComponent = reduxForm({ form: 'select-chain', validate })(connected);

export default formedComponent;
