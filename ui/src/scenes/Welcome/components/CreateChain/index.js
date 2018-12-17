import { connect } from 'react-redux';
import React, { Component } from 'react';
import { reduxForm, FieldArray, Field } from 'redux-form';
import ReduxedSelectField from '../../../../components/ReduxedSelectField';
import { Button } from 'react-md/lib';
import Paper from 'react-md/lib/Papers';
import Card from 'react-md/lib/Cards/Card';
import CardTitle from 'react-md/lib/Cards/CardTitle';
import Media, { MediaOverlay } from 'react-md/lib/Media';
import ReduxedTextField from '../../../../components/ReduxedTextField';
import { createChain } from '../../../../components/Chains/chains.actions';
import { browserHistory } from 'react-router';
import validate from './validate';
import './createChain.css'

const ENODE = 'enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303';
const CONTRACT = 'contract Governance { enum Rule { AutoApprove, TwoIn, MajorityRules } Rule addRule; Rule removeRule; event MemberAdded (address member, string enode); event MemberRemoved (address member); mapping (address => uint) addVotes; mapping (address => uint) removeVotes; function voteToAdd(address m, string e) { uint votes = addVotes[m] + 1; if (satisfiesRule(addRule, votes)) { MemberAdded(m,e); addVotes[m] = 0; } else { addVotes[m] = votes; } } function voteToRemove(address m) { uint votes = removeVotes[m] + 1; if (satisfiesRule(removeRule, votes)) { MemberRemoved(m); removeVotes[m] = 0; } else { removeVotes[m] = votes; } } function satisfiesRule(Rule rule, uint votes) private returns (bool) { if (rule == Rule.AutoApprove) { return true; } else if (rule == Rule.TwoIn) { return votes >= 2; } else { return false; } } }';

class CreateChain extends Component {

  constructor(props) {
    super(props);
    this.state = { divLength: 1 };
  }

  submit = (values) => {
    let balances = [], members = [], users = [];

    values.users.forEach((user) => {
      balances.push({ address: user.address, balance: parseInt(user.balance, 10) })
      members.push({ address: user.address, enode: ENODE })
      users.push({ address: user.address, role: user.role })
    })

    let data = {
      label: values.chain_name,
      args: {},
      balances,
      members,
      src: CONTRACT,
      users
    }

    this.props.createChain(data);
  }

  renderUser = ({ fields }) => {
    return (
      <div className="md-cell md-cell--8-desktop md-cell--8-tablet md-cell--8-phone">
        {fields.map((user, index) =>
          <div key={index} className="md-cell md-cell--12-desktop md-cell--12-tablet md-cell--12-phone">
            <div className="user-form-border">
              <div className="md-text-right">
                <Button icon onClick={() => fields.remove(index)} title="Remove User" className="remove-button">delete</Button>
              </div>
              <Field
                id={`${user}.address`}
                name={`${user}.address`}
                type="text"
                label="User address"
                className="md-cell md-cell--12-desktop md-cell--12-tablet md-cell--12-phone"
                component={ReduxedTextField}
              />
              <Field
                id={`${user}.balance`}
                name={`${user}.balance`}
                type="text"
                label="User balance"
                className="md-cell md-cell--12-desktop md-cell--12-tablet md-cell--12-phone"
                component={ReduxedTextField}
              />
              <Field
                id={`${user}.role`}
                name={`${user}.role`}
                type="select"
                label="Select Role"
                menuItems={["SUPPLIER", "BUYER"]}
                className="md-cell md-cell--12-desktop md-cell--12-tablet md-cell--12-phone"
                component={ReduxedSelectField}
              />
            </div>
          </div>
        )}
        <div className="md-text-right">
          <Button icon onClick={() => fields.push({})} title="Add User">add</Button>
        </div>
      </div>
    )
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
            <Paper className="create-chain-paper">
              <form onSubmit={handleSubmit(this.submit)} className="form-width">
                <div className="md-grid">
                  <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
                  <Field
                    id="chain_name"
                    name="chain_name"
                    type="text"
                    label="Chain Name"
                    className="md-cell md-cell--8-desktop md-cell--10-tablet md-cell--10-phone"
                    component={ReduxedTextField}
                  />
                  <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
                  <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
                  <FieldArray name="users" component={this.renderUser} />
                  <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
                  <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
                  <div className="md-cell md-cell--3-desktop md-cell--5-tablet md-cell--5-phone login-cell">
                    <Button raised primary label="back" disabled={this.props.isSpinning} onClick={() => { browserHistory.replace('/welcome') }} />
                  </div>
                  <div className="md-cell md-cell--2-desktop md-cell--1-tablet md-cell--1-phone" />
                  <div className="md-cell md-cell--3-desktop md-cell--10-tablet md-cell--10-phone md-text-right login-cell">
                    <Button raised primary label="Create Chain" type="submit" disabled={this.props.isSpinning} />
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
    isSpinning: state.chains.spinning
  };
}

const connected = connect(mapStateToProps, { createChain })(CreateChain);
const formedComponent = reduxForm({ form: 'create-chain', validate })(connected);

export default formedComponent