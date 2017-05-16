import React, { Component } from 'react';
import Card from 'react-md/lib/Cards/Card';
import Toolbar from 'react-md/lib/Toolbars';
import {Timeline, TimelineEvent} from 'react-event-timeline';
import FontIcon from 'react-md/lib/FontIcons';

class Status extends Component {
  render() {
    return (
      <Card>
        <Toolbar
          themed
          title={"Status"}
        />
        <Timeline>
          <TimelineEvent
            title="OPEN"
            icon={<i className="material-icons md-18">signal_cellular_off</i>}
            iconColor="#6fba1c"
          />
          <TimelineEvent
            title="OPEN"
            icon={<i className="material-icons md-18">signal_cellular_off</i>}
          />
        </Timeline>
      </Card>
    )
  }
}

export default Status;
