import React, { Component } from "react";
import { connect } from "react-redux";
import { openRequestRemovalModal, closeRequestRemovalModal, vote, fetchEntities, resetMessage } from "./requestRemoval.actions";
import { Field, reduxForm } from 'redux-form';
import Dialog from 'react-md/lib/Dialogs';
import Button from 'react-md/lib/Buttons';
import ReduxedTextField from '../../../../../../components/ReduxedTextField';
import { validate } from "./validate";
import ReduxedSelectField from "../../../../../../components/ReduxedSelectField";
import Snackbar from 'react-md/lib/Snackbars';

class RequestRemoval extends Component {

  componentDidMount() {
    this.props.fetchEntities(this.props.username);
  }

  submit = (values) => {
    values.voteType = "agree";
    values.entity = this.props.entities.currentEntity[0].name;
    this.props.vote(values);
  }

  render() {
    let entities = this.props.entities;

    const entityOptions = entities['entities'] ? entities.entities.map((entity, i) => {
      return (
        { label: entity.name, value: entity.id }
      )
    }) : [];


    return (
      <span>
        <Dialog
          id="inviteEntity"
          visible={this.props.isOpen}
          title={"Invite Entity"}
          dialogClassName='invite-entity-dialog'
          contentClassName="invite-entity-form"
          onHide={() => { 
            this.props.reset();
            this.props.closeRequestRemovalModal(); 
          }}>
          <form onSubmit={this.props.handleSubmit(this.submit)}>
            <div className="md-grid ">
              <Field
                id="entityID"
                name="entityID"
                type="select"
                label="Select entity"
                menuItems={entityOptions}
                required
                className="md-cell--12 md-cell--top"
                component={ReduxedSelectField}
              />

              <Field
                id="password"
                name="password"
                type="password"
                label="Confirm your Password"
                className="md-cell--12 md-cell--top"
                component={ReduxedTextField}
                required
              />

              <div className="md-cell--12">
                <Button raised primary label="Submit" type="submit" />
              </div>

            </div>
          </form>
        </Dialog>
        <Snackbar
          toasts={
            this.props.message
              ? [{ text: this.props.message, action: 'Dismiss' }]
              : []
          }
          onDismiss={() => { this.props.resetMessage() }} />
      </span>
    )
  }

}

export function mapStateToProps(state) {
  return {
    isOpen: state.requestRemoval.isOpen,
    entities: state.requestRemoval.entities,
    message: state.requestRemoval.message,
    username: state.login.username,
    isVoted: state.requestRemoval.isVoted,
  };
}

const formed = reduxForm({ form: 'request-removal', validate })(RequestRemoval);
const connected = connect(mapStateToProps, { openRequestRemovalModal, closeRequestRemovalModal, vote, fetchEntities, resetMessage })(formed);
export default connected;
