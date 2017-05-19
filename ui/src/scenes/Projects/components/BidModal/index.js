import React, { Component } from 'react';
import { connect } from 'react-redux';
import Dialog from 'react-md/lib/Dialogs';
import ReduxedTextField from '../../../../components/ReduxedTextField/';
import { reduxForm, Field } from 'redux-form';
//import FileInput from 'react-md/lib/FileInputs';
import Button from 'react-md/lib/Buttons';
import { bidSubmit, closeBidModal } from './bidModal.actions';
import mixpanel from 'mixpanel-browser';
import './BidModal.css';

class BidModal extends Component {

  closeDialog = () => {
    this.props.closeBidModal();
  }

  submit = (values) => {
    mixpanel.track('create_bid_click');
    this.props.bidSubmit({
      name: this.props.name,
      supplier: this.props.supplier,
      amount: values.amount
    });
    this.props.closeBidModal();
  }

  render() {
    const {
      handleSubmit
    } = this.props;

    return(
      <Dialog
      id="simpleDialogExample"
      visible={this.props.isOpen}
      title={ "Bid for " + this.props.name }
      onHide={this.closeDialog}>
      <form onSubmit={handleSubmit(this.submit)}>
        <div className="md-grid">
          <Field
            id="amount"
            name="amount"
            type="number"
            label="Enter Bid Amount"
            className="md-cell--12 md-cell--top"
            component={ReduxedTextField}
          />
          {/*<div className="md-cell--12 center">
            <br />
            <h4> Upload project plan </h4>
          </div>
          <FileInput
            id="proposal"
            accept="*"
            flat
            iconBefore
            className="md-cell--12 md-cell--right"
          />*/}
          <div className="md-cell--12">
            <Button raised primary label="Bid" type="submit" className="bid-button"/>
          </div>

        </div>
      </form>
    </Dialog>
    );
  }

}

function mapStateToProps(state) {
  return {
    supplier: state.login.username,
    isOpen: state.bidModal.isOpen
  };
}

const connected = connect(mapStateToProps, { bidSubmit, closeBidModal })(BidModal);

const formedComponent = reduxForm({ form: 'bid'})(connected);

export default formedComponent;
