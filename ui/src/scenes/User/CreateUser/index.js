import React, { Component } from 'react';
import { connect } from 'react-redux';
import Button from 'react-md/lib/Buttons/Button';
import { reduxForm, Field } from 'redux-form';
import ReduxedTextField from '../../../components/ReduxedTextField';
import ReduxedSelectField from '../../../components/ReduxedSelectField';
import mixpanel from 'mixpanel-browser';
import { fetchChains } from '../../../components/Chains/chains.actions';
import { fetchAccounts, fetchUserAddresses } from '../../../components/Accounts/accounts.actions';
import { createUserRequest, resetUserSuccess } from '../user.actions';

class CreateUser extends Component {

  onUsernameChange = (e, value) => {
    this.props.fetchUserAddresses(value);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.userSuccess) {
      this.props.reset();
      this.props.resetUserSuccess();
    }
  }

  submit = (values) => {
    mixpanel.track('create_user_click');
    this.props.createUserRequest(values);
  }

  render() {
    const {
      handleSubmit
    } = this.props;

    return (
      <form onSubmit={handleSubmit(this.submit)} className="form-width">
        <div className="md-grid">
          <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
          <Field
            id="createUserChainId"
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
            id="createUserUsername"
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
            id="createUserAddress"
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
            id="createUserPassword"
            name="password"
            type="password"
            label="Password"
            className="md-cell md-cell--8-desktop md-cell--10-tablet md-cell--10-phone"
            component={ReduxedTextField}
          />
          <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
          <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
          <Field
            id="createUserRole"
            name="role"
            type="select"
            label="Select Role"
            menuItems={["SUPPLIER", "BUYER"]}
            className="md-cell md-cell--8-desktop md-cell--10-tablet md-cell--10-phone"
            component={ReduxedSelectField}
          />
          <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
          <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
          <div className="md-cell md-cell--8-desktop md-cell--5-tablet md-cell--10-phone md-text-right login-cell">
            <Button raised primary label="Create User" type="submit" disabled={this.props.isLoading} />
          </div>
        </div>
      </form>
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
    isLoading: state.user.isLoading,
    userSuccess: state.user.success
  };
}

const connected = connect(mapStateToProps, { fetchChains, fetchAccounts, fetchUserAddresses, createUserRequest, resetUserSuccess })(CreateUser);

const formedComponent = reduxForm({ form: 'create-user', validate })(connected);

export default formedComponent;
