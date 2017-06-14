import React, { Component } from 'react';
import Card from 'react-md/lib/Cards/Card';
import Toolbar from 'react-md/lib/Toolbars';
import {Timeline, TimelineEvent} from 'react-event-timeline';
import { STATES } from '../../../../../../constants';


class Status extends Component {
  render() {
    const timelineEvents =
    Object.getOwnPropertyNames(STATES)
      .filter((val) => {
         return val.length === 1;
       })
       .map(
        (state,i) =>
          <TimelineEvent
            key={'timeline' + i}
            title=""
            createdAt=""
            icon={<i className="material-icons" style={{fontSize: '16px'}}>{STATES[state].icon}</i>}
            contentStyle={{ border:0, boxShadow: 'none' }}
            iconColor={ parseInt(state, 10) === parseInt(this.props.state, 10) ? '#3F51B5' : '#ccc' }
            container="p"
          >
            <div
              className={ parseInt(state, 10) === parseInt(this.props.state, 10) ? 'md-title' : 'md-subheading-2' }
              style={{marginTop: '-5px', color: parseInt(state, 10) === parseInt(this.props.state, 10) ? '#3F51B5' : '#ccc'}}
            >
              {STATES[state].state}
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
