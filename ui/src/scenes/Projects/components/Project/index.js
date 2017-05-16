import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import Button from 'react-md/lib/Buttons/Button';
import Card from 'react-md/lib/Cards/Card';
import CardTitle from 'react-md/lib/Cards/CardTitle';
import CardText from 'react-md/lib/Cards/CardText';
import Chip from 'react-md/lib/Chips';
import Toolbar from 'react-md/lib/Toolbars';

import BidModal from '../BidModal/';
import { FormattedDate, FormattedTime, FormattedNumber } from 'react-intl';
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

  handleProjectEventClick = function(e, projectName, projectEvent) {
    e.stopPropagation();
    // project events enum: { NULL, ACCEPT, DELIVER, RECEIVE }
    this.props.projectEvent(projectName, projectEvent);

  };

  render() {
    let projectButtons = '';
    const project = this.props.project;

    if (this.isBuyer) {
      if (project.state === 'INTRANSIT') {
        projectButtons =
          <div className="md-cell">
            <Button raised primary onClick={(e) => this.handleProjectEventClick(e, project.name, 3)} label="Mark as Received" />
          </div>
      }
    } else {
      if (project.state === 'PRODUCTION') {
        // TODO: check that accepted bid is made by current supplier
        projectButtons =
          <div className="md-cell">
            <Button raised primary onClick={(e) => this.handleProjectEventClick(e, project.name, 2)} label="Mark as Shipped" />
          </div>
      }
    }

    const projectContent =
      <Card className="md-cell md-cell--12">
        <CardTitle
          title={project.name ? project.name : ''}
           subtitle={
             project.created
             ? <span>
                 <FormattedDate
                   value={new Date(project.created)}
                   day="numeric"
                   month="long"
                   year="numeric"/>, <FormattedTime value={new Date(project.created)} />
               </span>
             : ''
           }
        />
        <CardText>
          <div className="md-grid">
            {projectButtons}
            <div className="md-cell md-cell--12">
              <h4 className="md-title">Status:</h4>
              {project.state ? project.state : ''}
            </div>
          </div>
          <div className="md-grid">
            <div className="md-cell md-cell--12">
              <h4 className="md-title">Description:</h4>
              {project.description ? project.description : '-'}
            </div>
          </div>
          <div className="md-grid">
            <div className="md-cell md-cell--12">
              <h4 className="md-title">Desired price:</h4>
              {
                project.price
                ? <FormattedNumber
                    value={project.price}
                    style="currency" //eslint-disable-line
                    currency="USD" />
                : ''
              }
            </div>
          </div>
          <div className="md-grid">
            <div className="md-cell md-cell--12">
              <h4 className="md-title ">Deliver by:</h4>
              {
                project.targetDelivery
                ? <FormattedDate
                    value={new Date(project.targetDelivery)}
                    day="numeric"
                    month="long"
                    year="numeric"/>
                : ''
              }
            </div>
          </div>
          {/*<div className="md-grid">*/}
            {/*<div className="md-cell md-cell--12">*/}
              {/*<h4 className="md-title ">Deliver address:</h4>*/}
              {/*/!*{`${project.deliveryAddress.street}, ${project.deliveryAddress.city}, ${project.deliveryAddress.state}, ${project.deliveryAddress.zip}`}*!/*/}
            {/*</div>*/}
          {/*</div>*/}
          <div className="md-grid">
            <div className="md-cell md-cell--12">
              <h4 className="md-title ">Specification:</h4>
              {project.spec ? project.spec : '-'}
            </div>
          </div>
          { project.delivered
            ? <div className="md-grid">
                <div className="md-cell md-cell--12">
                  <h4 className="md-title ">Delivered on:</h4>
                  <FormattedDate
                    value={new Date(project.delivered)}
                    day="numeric"
                    month="long"
                    year="numeric"/>, <FormattedTime value={new Date(project.delivered)} />
                </div>
              </div>
            : null
          }
        </CardText>
      </Card>

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
      if(!this.isBuyer && project.state === 'OPEN') {
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
            <Status />
          </div>
          <div className="md-cell md-cell--4 md-cell--12-phone">
            <Detail />
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
