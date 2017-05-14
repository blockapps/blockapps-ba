import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Button from 'react-md/lib/Buttons/Button';
import Card from 'react-md/lib/Cards/Card';
import CardTitle from 'react-md/lib/Cards/CardTitle';
import CardText from 'react-md/lib/Cards/CardText';
import BidTable from '../BidTable/';

// import { browserHistory } from 'react-router';
import { FormattedDate, FormattedTime, FormattedNumber } from 'react-intl';

import { fetchProject } from './actions/project.actions';

class Project extends Component {

  componentWillMount() {
    this.props.fetchProject(encodeURI(this.props.params['pname']));
  }

  get isBuyer() {
    return this.props.login['role'] === 'BUYER'
  }

  render() {
    let projectContent;

    if (this.props.project) {
      const project = this.props.project;

      projectContent =
        <Card className="md-cell md-cell--12">
          <CardTitle
            title={project.name ? project.name : ''}
             subtitle={
               <span>
                 <FormattedDate
                   value={new Date(project.created)}
                   day="numeric"
                   month="long"
                   year="numeric"/>, <FormattedTime value={new Date(project.created)} />
               </span>
             }
          />
          <CardText>
            <div className="md-grid">
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
                !this.isBuyer
                ? <div className="md-cell md-cell--1">
                    <Link className="md-cell--right" to={'/projects/' + project.name + "/bid"}>
                      <Button raised primary label="Add Bid" />
                    </Link>
                  </div>
                : ''
              }
              <div className="md-cell md-cell--12">
                <BidTable name={project.name} bids={project.bids ? project.bids : []} projectState={project.state} />
              </div>
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

export default connect(mapStateToProps, { fetchProject })(Project);
