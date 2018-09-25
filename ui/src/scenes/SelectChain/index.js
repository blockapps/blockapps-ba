import React, { Component } from 'react';
import { connect } from 'react-redux';
import Button from 'react-md/lib/Buttons/Button';
import Paper from 'react-md/lib/Papers';
import Card from 'react-md/lib/Cards/Card';
import CardTitle from 'react-md/lib/Cards/CardTitle';
import { reduxForm, Field } from 'redux-form';
import ReduxedTextField from '../../components/ReduxedTextField';
import ReduxedSelectField from '../../components/ReduxedSelectField';
import Media, { MediaOverlay } from 'react-md/lib/Media';
import mixpanel from 'mixpanel-browser';
import { fetchChains, setChainID } from '../../components/Chains/chains.actions';
import { uploadContracts } from '../../components/UploadContracts/uploadContracts.actions';
import { fetchAccounts, fetchUserAddresses } from '../../components/Accounts/accounts.actions';
import { browserHistory } from 'react-router';

class SelectChain extends Component {

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
    mixpanel.track('deploy_click');
    this.props.setChainID(values.chainId);
    this.props.uploadContracts(values);
  }

  render() {
    const {
      // login,
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
                  <div className="md-cell md-cell--8-desktop md-cell--10-tablet md-cell--10-phone md-text-right login-cell">
                    <Button raised primary label="Deploy" type="submit" disabled={this.props.isUploading} />
                    <Button raised primary label="Login" type="button" onClick={this.navigateToLogin} style={{ marginLeft: '10px' }} />
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
    isUploading: state.uploadContract.isLoading
  };
}

const connected = connect(mapStateToProps, { fetchChains, uploadContracts, fetchAccounts, fetchUserAddresses, setChainID })(SelectChain);

const formedComponent = reduxForm({ form: 'select-chain', validate })(connected);

export default formedComponent;
