import React, { Component } from 'react';
import { connect } from 'react-redux';
import Dialog from 'react-md/lib/Dialogs';
import { browserHistory } from 'react-router';
import ReduxedTextField from '../../../../components/ReduxedTextField/';
import { reduxForm, Field } from 'redux-form';
//import FileInput from 'react-md/lib/FileInputs';
import Button from 'react-md/lib/Buttons';
import { bidSubmit } from './bid.actions';
import './Bid.css';

class Bid extends Component {

  closeDialog = () => {
    browserHistory.goBack();
  }

  submit = (values) => {
    this.props.bidSubmit({
      name: this.props.params.name,
      supplier: this.props.supplier,
      amount: values.amount
    });
  }

  render() {
    const {
      handleSubmit
    } = this.props;

    return(
      <Dialog
      id="simpleDialogExample"
      visible={true}
      title={ "Bid for " + this.props.params.name }
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
    supplier: state.login.username
  };
}

const connected = connect(mapStateToProps, { bidSubmit })(Bid);

const formedComponent = reduxForm({ form: 'bid'})(connected);

export default formedComponent;
