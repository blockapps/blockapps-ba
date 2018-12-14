import { connect } from 'react-redux';
import React, { Component } from 'react';
import { fetchChains } from '../../components/Chains/chains.actions';
import { reduxForm, Field } from 'redux-form';
import ReduxedSelectField from '../../components/ReduxedSelectField';
import { Button } from 'react-md/lib';
import Paper from 'react-md/lib/Papers';
import Card from 'react-md/lib/Cards/Card';
import CardTitle from 'react-md/lib/Cards/CardTitle';
import Media, { MediaOverlay } from 'react-md/lib/Media';
import { browserHistory } from 'react-router';
import { me, getUser } from '../Login/login.actions';

class Welcome extends Component {

  componentDidMount() {
    this.props.fetchChains();
    this.props.me();
    if(this.props.authenticated) 
      browserHistory.replace('/projects');
  }

  navigate() {
    browserHistory.replace('create-chain');
  }

  submit = (values) => {
    var args = {
      chainId: values.chainId,
      address: this.props.address
    }

    this.props.getUser(args);
  }

  render() {
    const { handleSubmit } = this.props;

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
            <Paper className="login-paper">
              <form onSubmit={handleSubmit(this.submit)} className="form-width">
                <div className="md-grid">
                  <div className="md-cell md-cell--12-desktop md-cell--1-tablet md-cell--1-phone">
                    <h1> Welcome, </h1>
                  </div>
                  <div className="md-cell md-cell--12-desktop md-cell--1-tablet md-cell--1-phone">
                    <h4> Your address {this.props.address} </h4>
                  </div>
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
                  <div className="md-cell md-cell--4-desktop md-cell--5-tablet md-cell--5-phone md-text-right login-cell">
                    <Button raised primary label="Next" type="submit" />
                  </div>
                  <div className="md-cell md-cell--4-desktop md-cell--5-tablet md-cell--5-phone md-text-right login-cell">
                    <Button raised primary label="Create Chain" onClick={this.navigate} />
                  </div>
                  <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
                </div>
              </form>
            </Paper>
          </Card>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    chains: state.chains.chainIds,
    address: state.login.address,
    authenticated: state.login.authenticated,
  };
}

const connected = connect(mapStateToProps, { fetchChains, me, getUser })(Welcome);
const formedComponent = reduxForm({ form: 'welcome' })(connected);

export default formedComponent
