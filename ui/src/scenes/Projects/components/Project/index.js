import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import Button from 'react-md/lib/Buttons/Button';
import Chip from 'react-md/lib/Chips';
import Toolbar from 'react-md/lib/Toolbars';

import BidModal from '../BidModal/';
import { fetchProject } from './actions/project.actions';
import { fetchProjectBids } from './components/Bids/components/BidTable/actions/projectBids.actions';
import { projectEvent } from './actions/project-event.actions';
import { openBidModal } from '../BidModal/bidModal.actions';
import Status from './components/Status';
import Detail from './components/Detail';
import Bids from './components/Bids';
import mixpanel from 'mixpanel-browser';
import { ROLES, BID_STATES, STATES } from '../../../../constants';
import './Project.css';

class Project extends Component {

  componentWillMount() {
    this.props.fetchProject(encodeURI(this.props.params['pname']));
    this.props.fetchProjectBids(encodeURI(this.props.params['pname']));
  }

  get isBuyer() {
    return parseInt(this.props.login['role'], 10) === ROLES.BUYER;
  }

  get isSupplier() {
    return parseInt(this.props.login['role'], 10) === ROLES.SUPPLIER;
  }

  handleProjectEventClick = function (e, projectName, projectEvent) {
    e.stopPropagation();
    // project events enum: { NULL, ACCEPT, DELIVER, RECEIVE }
    const location = 'project_event_' + projectEvent;
    mixpanel.track(location);
    this.props.projectEvent(projectName, projectEvent, this.props.login['username']);
  };

  render() {
    const project = this.props.project;
    const actions = [];
    const children = [];
    if (project && project.name && parseInt(project.state, 10)) {
      //children
      children.push(
        <Chip
          key="state"
          label={STATES[parseInt(project.state, 10)].state}
          className="state-chip"
        />
      );

      //actions
      if (this.isBuyer) {

        if (parseInt(project.state, 10) === STATES.INTRANSIT) {
          actions.push(
            <Button
              icon
              primary
              onClick={(e) => this.handleProjectEventClick(e, project.name, 3)}
              tooltipLabel="Mark as Received"
              key="mood"
            >
              mood
              </Button>
          );
        }
      }

      if (this.isSupplier) {
        if (parseInt(project.state, 10) === STATES.PRODUCTION) {
          const myBidAccepted = this.props.bids.some(
            bid =>
              BID_STATES[parseInt(bid.state, 10)] === 'ACCEPTED' && bid.supplier === this.props.login.username
          );
          if (myBidAccepted) {
            actions.push(
              <Button
                icon
                onClick={(e) => this.handleProjectEventClick(e, project.name, 2)}
                tooltipLabel="Mark as Shipped"
                key="flight_takeoff"
              >
                flight_takeoff
              </Button>
            );
          }
        }

        if (parseInt(project.state, 10) === STATES.OPEN) {
          actions.push(
            <Button
              icon
              key="gavel"
              tooltipLabel="Bid"
              onClick={(e) => {
                e.stopPropagation();
                mixpanel.track('open_bid_modal_click');
                this.props.openBidModal();
              }
              }>
              gavel
              </Button>
          );
        }
      }

      actions.push(
        <Button
          icon
          key="home"
          tooltipLabel="Home"
          onClick={(e) => {
            e.stopPropagation();
            mixpanel.track('home_click');
            browserHistory.push('/projects');
          }
          }>
          home
        </Button>
      );
    }

    return (
      <section>
        <Toolbar
          themed
          title={project.name}
          className="project-title"
          actions={actions}
          children={children}
        />
        <BidModal name={project.name} />
        <div className="md-grid">
          <div className="md-cell md-cell--4 md-cell--12-phone">
            <Status state={project.state} />
          </div>
          <div className="md-cell md-cell--4 md-cell--12-phone">
            <Detail project={project} />
          </div>
          <div className="md-cell md-cell--4  md-cell--12-phone">
            <Bids project={project} bids={this.props.bids} />
          </div>
        </div>
      </section>
    );
  }
}

function mapStateToProps(state) {
  return {
    project: state.project.project,
    login: state.login,
    bids: state.bids.bids,
  };
}

export default connect(mapStateToProps, { fetchProject, fetchProjectBids, projectEvent, openBidModal })(Project);
