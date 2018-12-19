const plainPng = require('./png/plain.png')
const settingPng = require('./png/setting.png')
const smilyPng = require('./png/smily.png')
const viewPng = require('./png/View.png')
import React, { Component } from 'react';
import Card from 'react-md/lib/Cards/Card';
import Toolbar from 'react-md/lib/Toolbars';
import { STATES } from '../../../../../../constants';
import Stepper from 'react-stepper-horizontal';
import './status.css';

class Status extends Component {
  render() {
    const projectState = parseInt(this.props.state, 10) - 1;
    return (
      <Card>
        <Toolbar
          themed
          title={"Status"}
        />
        <div className="status-stepper">
          <Stepper
            size={40}
            steps={
              [
                { title: STATES[1].state, icon: viewPng },
                { title: STATES[2].state, icon: settingPng },
                { title: STATES[3].state, icon: plainPng },
                { title: STATES[4].state, icon: smilyPng }
              ]}
            activeStep={projectState}
            activeColor={this.props.isSupplier ? "#3982C9" : "#3f51b5"}
            completeColor="#3f76c0"
            completeOpacity="0.7"
          />
        </div>
      </Card>
    )
  }
}

export default Status;
