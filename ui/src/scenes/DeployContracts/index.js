import React, { Component } from 'react';
import { connect } from 'react-redux';
import Button from 'react-md/lib/Buttons/Button';
import { reduxForm, Field } from 'redux-form';
import ReduxedTextField from '../../components/ReduxedTextField';
import ReduxedSelectField from '../../components/ReduxedSelectField';
import mixpanel from 'mixpanel-browser';
import { fetchChains } from '../../components/Chains/chains.actions';
import { uploadContracts, resetUploadContractsData } from '../../components/UploadContracts/uploadContracts.actions';
import { fetchAccounts, fetchUserAddresses } from '../../components/Accounts/accounts.actions';

class DeployContracts extends Component {

  onUsernameChange = (e, value) => {
    this.props.fetchUserAddresses(value);
  }

  submit = (values) => {
    mixpanel.track('deploy_click');
    this.props.uploadContracts(values);
  }

  componentWillReceiveProps(props) {
    if (props.uploadContractData) {
      this.props.reset();
      this.props.resetUploadContractsData();
    }
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
            id="admin_username"
            name="admin_username"
            type="select"
            menuItems={this.props.accounts}
            onChange={this.onUsernameChange}
            label="Admin Username"
            className="md-cell md-cell--8-desktop md-cell--10-tablet md-cell--10-phone"
            component={ReduxedSelectField}
          />
          <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
          <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
          <Field
            id="admin_address"
            name="admin_address"
            type="select"
            menuItems={this.props.accountAddresses}
            label="Admin Address"
            className="md-cell md-cell--8-desktop md-cell--10-tablet md-cell--10-phone"
            component={ReduxedSelectField}
          />
          <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
          <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
          <Field
            id="contract_password"
            name="password"
            type="password"
            label="Password"
            className="md-cell md-cell--8-desktop md-cell--10-tablet md-cell--10-phone"
            component={ReduxedTextField}
          />
          <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
          <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
          <Field
            id="contract_chainId"
            name="chainId"
            type="select"
            label="Select Chain"
            menuItems={this.props.chains}
            className="md-cell md-cell--8-desktop md-cell--10-tablet md-cell--10-phone"
            component={ReduxedSelectField}
          />
          <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
          <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
          <div className="md-cell md-cell--8-desktop md-cell--5-tablet md-cell--10-phone md-text-right login-cell">
            <Button raised primary label="Deploy" type="submit" disabled={this.props.isUploading} />
          </div>
        </div>
      </form>
    );
  }
}

function validate(values) {
  let errors = {};

  if (!values.admin_username) {
    errors.admin_username = "required"
  }

  if (!values.admin_address) {
    errors.admin_address = "required"
  }

  if (!values.password) {
    errors.password = "required"
  }

  if (!values.chainId) {
    errors.chainId = "required"
  }

  return errors;
}

function mapStateToProps(state) {
  return {
    chains: state.chains.chainIds,
    accounts: state.account.accounts,
    accountAddresses: state.account.accountAddresses,
    isUploading: state.uploadContract.isLoading,
    uploadContractData: state.uploadContract.uploadContractData
  };
}

const connected = connect(mapStateToProps, { fetchChains, uploadContracts, fetchAccounts, fetchUserAddresses, resetUploadContractsData })(DeployContracts);

const formedComponent = reduxForm({ form: 'deploy-contracts', validate })(connected);

export default formedComponent;
