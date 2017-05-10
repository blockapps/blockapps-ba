import React, { Component } from 'react';
import Card from 'react-md/lib/Cards/Card';
import CardTitle from 'react-md/lib/Cards/CardTitle';
import CardText from 'react-md/lib/Cards/CardText';
import { connect } from 'react-redux';
// import { browserHistory } from 'react-router';
import { FormattedDate, FormattedTime, FormattedNumber } from 'react-intl';

import { fetchProject } from './project.actions';

class Project extends Component {

  componentWillMount() {
    this.props.fetchProject(this.props.params['pid']);
  }

  render() {
    let projectContent;

    if (this.props.project) {
      const project = this.props.project;
      projectContent =
        <Card className="md-cell md-cell--12">
          <CardTitle
            title={project.name}
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
              <h4 className="md-title md-cell md-cell--12">Description</h4>
              <div className="md-cell md-cell--12">
                {project.description}
              </div>
            </div>
            <div className="md-grid">
              <h4 className="md-title md-cell md-cell--12">Desired price</h4>
              <div className="md-cell md-cell--12">
                <FormattedNumber
                  value={project.priceDesired}
                  style="currency" //eslint-disable-line
                  currency="USD" />
              </div>
            </div>
            <div className="md-grid">
              <h4 className="md-title md-cell md-cell--12">@todo</h4>
              <div className="md-cell md-cell--12">
                @todo
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
    )
  }
}

function mapStateToProps(state) {
  return {
    project: state.project.project
  };
}

export default connect(mapStateToProps, { fetchProject })(Project);
