import { connect } from 'react-redux';
import React, { Component } from 'react';
import Paper from 'react-md/lib/Papers';
import Card from 'react-md/lib/Cards/Card';
import CardTitle from 'react-md/lib/Cards/CardTitle';
import Media, { MediaOverlay } from 'react-md/lib/Media';
import './Login.css';
import { TabsContainer, Tabs, Tab } from 'react-md';
import DeployContracts from '../DeployContracts';
import CreateUser from '../User/CreateUser';
import LoginForm from './LoginForm';
import { fetchChains } from '../../components/Chains/chains.actions';
import { fetchAccounts } from '../../components/Accounts/accounts.actions';

class Login extends Component {

  componentDidMount() {
    this.props.fetchChains();
    this.props.fetchAccounts();
  }

  render() {
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
              <TabsContainer panelClassName="md-grid" colored>
                <Tabs tabId="simple-tab">
                  <Tab label="Login">
                    <LoginForm />
                  </Tab>
                  <Tab label="Deploy Contracts">
                    <DeployContracts />
                  </Tab>
                  <Tab label="Create User">
                    <CreateUser />
                  </Tab>
                </Tabs>
              </TabsContainer>
            </Paper>
          </Card>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {  };
}

const loginComponent = connect(mapStateToProps, { fetchChains, fetchAccounts })(Login);

export default loginComponent;
