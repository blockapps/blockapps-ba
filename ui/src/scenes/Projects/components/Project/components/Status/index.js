import React, { Component } from 'react';
import Card from 'react-md/lib/Cards/Card';
import Toolbar from 'react-md/lib/Toolbars';
import {Timeline, TimelineEvent} from 'react-event-timeline';
import { STATES } from '../../../../../../constants';


class Status extends Component {
  render() {
    const timelineEvents = Object.getOwnPropertyNames(STATES).map(
      (state,i) =>
        <TimelineEvent
          key={'timeline' + i}
          title=""
          createdAt=""
          icon={<i className="material-icons" style={{fontSize: '16px'}}>{STATES[state].icon}</i>}
          contentStyle={{ border:0, boxShadow: 'none' }}
          iconColor={ state === this.props.state ? '#3F51B5' : '#ccc' }
          container="p"
        >
          <div
            className={ state === this.props.state ? 'md-title' : 'md-subheading-2' }
            style={{marginTop: '-5px', color: state === this.props.state ? '#3F51B5' : '#ccc'}}
          >
            {state}
          </div>
        </TimelineEvent>
    );

    return (
      <Card>
        <Toolbar
          themed
          title={"Status"}
        />
        <Timeline>
          {timelineEvents}
        </Timeline>
      </Card>
    )
  }
}

export default Status;
