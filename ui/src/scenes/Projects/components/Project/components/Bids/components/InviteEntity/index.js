import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReduxedTextField from '../../../../../../../../components/ReduxedTextField';
import { reduxForm, Field } from 'redux-form';
import Dialog from 'react-md/lib/Dialogs';
import Button from 'react-md/lib/Buttons';
import Snackbar from 'react-md/lib/Snackbars';
import { openInviteEntityModal, closeInviteEntityModal, inviteEntityRequest, resetMessage } from './inviteEntity.actions';
import { validate } from './validate';
import './inviteEntity.css';

class InviteEntity extends Component {

  submit = (values) => {
    this.props.inviteEntityRequest(values);
  }

  render() {
    const {
      handleSubmit
    } = this.props;

    return (
      <div>
        <Button
          raised
          primary
          label="Invite Entity"
          className='invite-entity-button'
          onClick={ () => {
            this.props.reset();
            this.props.openInviteEntityModal();
          }}
          type="button" />
        <Dialog
          id="inviteEntity"
          visible={this.props.isOpen}
          title={"Invite Entity"}
          dialogClassName='invite-entity-dialog'
          contentClassName="invite-entity-form"
          onHide={this.props.closeInviteEntityModal}>
          <form onSubmit={handleSubmit(this.submit)}>
            <div className="md-grid ">
              <Field
                id="name"
                name="name"
                type="text"
                label="Entity Name"
                className="md-cell--12 md-cell--top"
                component={ReduxedTextField}
                required
              />

              <Field
                id="eNodeUrl"
                name="eNodeUrl"
                type="text"
                label="E-Node URL"
                className="md-cell--12 md-cell--top"
                component={ReduxedTextField}
                required
              />
              
              <Field
                id="adminEthereumAddress"
                name="adminEthereumAddress"
                type="text"
                label="Admin Ethereum Address"
                className="md-cell--12 md-cell--top"
                component={ReduxedTextField}
                required
              />

              <Field
                id="adminName"
                name="adminName"
                type="text"
                label="Admin Name"
                className="md-cell--12 md-cell--top"
                component={ReduxedTextField}
                required
              />

              <Field
                id="adminEmail"
                name="adminEmail"
                type="text"
                label="Admin Email"
                className="md-cell--12 md-cell--top"
                component={ReduxedTextField}
                required
              />

              <Field
                id="tokenAmount"
                name="tokenAmount"
                type="number"
                label="Token Amount"
                className="md-cell--12 md-cell--top"
                component={ReduxedTextField}
                required
              />

              <div className="md-cell--12">
                <Button raised primary label="Invite" type="submit" className="bid-button" />
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
      </div>
    );
  }

}

function mapStateToProps(state) {
  return {
    isOpen: state.inviteEntity.isOpen,
    message: state.inviteEntity.message,
  };
}

const connected = connect(mapStateToProps, { openInviteEntityModal, closeInviteEntityModal, inviteEntityRequest, resetMessage })(InviteEntity);

const formedComponent = reduxForm({ form: 'invite-entity', validate })(connected);

export default formedComponent;
