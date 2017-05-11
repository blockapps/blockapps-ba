import React, { Component } from 'react';
import { connect } from 'react-redux';
import Dialog from 'react-md/lib/Dialogs';
import { browserHistory } from 'react-router';
import ReduxedTextField from '../../../../components/ReduxedTextField/';
import { reduxForm, Field } from 'redux-form';

class Bid extends Component {

  closeDialog = () => {
    browserHistory.goBack();
  }

  render() {
    return(
      <Dialog
      id="simpleDialogExample"
      visible={true}
      title="Bid for some contract"
      onHide={this.closeDialog}>
      <form>
        <div className="md-grid">
          <Field
            id="amount"
            name="amount"
            label="Enter Bid Amount"
            className="md-cell--12 md-cell--top"
            component={ReduxedTextField} />
        </div>
      </form>
    </Dialog>
    );
  }

}

function mapStateToProps(state) {
  return {
  };
}

const connected = connect(mapStateToProps, {  })(Bid);

const formedComponent = reduxForm({ form: 'bid'})(connected);

export default formedComponent;
