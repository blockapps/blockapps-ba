import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import Button from 'react-md/lib/Buttons/Button';
import Chip from 'react-md/lib/Chips';
import Toolbar from 'react-md/lib/Toolbars';

import BidModal from '../BidModal/';
import { fetchProject } from './actions/project.actions';
import { projectEvent } from './actions/project-event.actions';
import { openBidModal } from '../BidModal/bidModal.actions';
import Status from './components/Status';
import Detail from './components/Detail';
import Bids from './components/Bids';

import './Project.css';

class Project extends Component {

  componentWillMount() {
    this.props.fetchProject(encodeURI(this.props.params['pname']));
  }

  get isBuyer() {
    return this.props.login['role'] === 'BUYER'
  }

  get isSupplier() {
    return this.props.login['role'] === 'SUPPLIER'
  }

  handleProjectEventClick = function(e, projectName, projectEvent) {
    e.stopPropagation();
    // project events enum: { NULL, ACCEPT, DELIVER, RECEIVE }
    this.props.projectEvent(projectName, projectEvent);

  };

  render() {
    const project = this.props.project;
    const actions = [];
    const children = [];

    if(project && project.name && project.state) {
      //children
      children.push(
        <Chip
          key="state"
          label={project.state}
          className="state-chip"
        />
      );

      //actions
      if (this.isBuyer) {

        if (project.state === 'INTRANSIT') {
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

      if(this.isSupplier) {
        if (project.state === 'PRODUCTION') {
          // TODO: check that accepted bid is made by current supplier
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
        if(project.state === 'OPEN') {
          actions.push(
            <Button
              icon
              key="gavel"
              tooltipLabel="Bid"
              onClick={(e) => {
                  e.stopPropagation();
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
          actions={actions}
          children={children}
        />
        <BidModal name={project.name}/>
        <div className="md-grid">
          <div className="md-cell md-cell--4 md-cell--12-phone">
            <Status state={project.state} />
          </div>
          <div className="md-cell md-cell--4 md-cell--12-phone">
            <Detail project={project}/>
          </div>
          <div className="md-cell md-cell--4  md-cell--12-phone">
            <Bids project={project} />
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
  };
}

export default connect(mapStateToProps, { fetchProject, projectEvent, openBidModal })(Project);
