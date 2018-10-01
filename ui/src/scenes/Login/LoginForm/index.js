import React, { Component } from 'react';
import { connect } from 'react-redux';
import Button from 'react-md/lib/Buttons/Button';
import { reduxForm, Field } from 'redux-form';
import { userLoginSubmit } from '../login.actions';
import ReduxedTextField from '../../../components/ReduxedTextField';
import mixpanel from 'mixpanel-browser';
import { fetchChains, setChainID } from '../../../components/Chains/chains.actions';
import { uploadContracts } from '../../../components/UploadContracts/uploadContracts.actions';
import ReduxedSelectField from '../../../components/ReduxedSelectField';

class LoginForm extends Component {

  submit = (values) => {
    mixpanel.track('login_click');
    this.props.setChainID(values.chainId);
    this.props.userLoginSubmit(values.username, values.password, values.chainId);
  }

  render() {
    const {
      // login,
      handleSubmit
    } = this.props;

    return (

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
            type="text"
            label="Enter Username"
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
          <div className="md-cell md-cell--8-desktop md-cell--10-tablet md-cell--10-phone md-text-right login-cell">
            <Button raised primary label="Login" type="submit" />
          </div>
          <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
        </div>
      </form>
    );
  }
}

function mapStateToProps(state) {
  return {
    login: state.login,
    chains: state.chains.chainIds,
    chainId: state.chains.chainId,
    isUploading: state.uploadContract.isLoading
  };
}

const connected = connect(mapStateToProps, { userLoginSubmit, fetchChains, uploadContracts, setChainID })(LoginForm);

const formedComponent = reduxForm({ form: 'login' })(connected);

export default formedComponent;
