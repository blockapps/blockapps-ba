import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Button from 'react-md/lib/Buttons/Button';
import Card from 'react-md/lib/Cards/Card';
import CardTitle from 'react-md/lib/Cards/CardTitle';
import CardText from 'react-md/lib/Cards/CardText';
import BidTable from '../BidTable/';
import { FormattedDate, FormattedTime, FormattedNumber } from 'react-intl';
import { fetchProject } from './actions/project.actions';
import { projectEvent } from './actions/project-event.actions';

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
    let projectContent;
    let projectButtons = '';

    if (this.props.project) {
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

        projectContent =
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
                {project.description ? project.description : ''}
              </div>
            </div>
            <div className="md-grid">
              <div className="md-cell md-cell--12">
                <h4 className="md-title">Desired price:</h4>
                <FormattedNumber
                  value={project.price}
                  style="currency" //eslint-disable-line
                  currency="USD" />
              </div>
            </div>
            <div className="md-grid">
              <div className="md-cell md-cell--12">
                <h4 className="md-title ">Deliver by:</h4>
                <FormattedDate
                  value={new Date(project.targetDelivery)}
                  day="numeric"
                  month="long"
                  year="numeric"/>
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
                {project.spec ? project.spec : ''}
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
            <div className="md-grid">
              <div className="md-cell md-cell--11">
                <h4 className="md-title ">Bids</h4>
              </div>
              {
                !this.isBuyer && project.state === 'OPEN'
                ? <div className="md-cell md-cell--1">
                    <Link className="md-cell--right" to={'/projects/' + project.name + "/bid"}>
                      <Button raised primary label="Add Bid" />
                    </Link>
                  </div>
                : ''
              }
              {
                project.name && project.name.length > 0
                ? <div className="md-cell md-cell--12">
                    <BidTable name={project.name} projectState={project.state} />
                  </div>
                : ''
              }
            </div>
          </CardText>
        </Card>
    }

    return (
      <section>
        <h2>Project</h2>
        <div className="md-grid">
          {projectContent}
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

export default connect(mapStateToProps, { fetchProject, projectEvent })(Project);
