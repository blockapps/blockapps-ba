import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import Button from 'react-md/lib/Buttons/Button';

import ProjectsList from './components/ProjectsList';

class Projects extends Component {

  handleNewProjectClick = function(e) {
    e.stopPropagation();
    browserHistory.push(`/projects/create`);
  };

  get isBuyer() {
    return this.props.login['roles'] === 'BUYER'
      || (Array.isArray(this.props.login['roles']) && 'BUYER' in this.props.login['roles'])
  }

  render() {

    return (
      <section>
        <h2>Projects</h2>
        <div className="md-grid">
          {
            this.isBuyer
            ? <div className="md-cell">
                <Button flat primary label="New Project" onClick={(e) => this.handleNewProjectClick(e)}>add_circle</Button>
              </div>
            : ''
          }

            {
              this.isBuyer
              ? <div className="md-cell--12">
                  <ProjectsList listType="buyerList" listTitle="My Projects" />
                </div>
              : <div className="md-cell--12">
                  <ProjectsList listType="allOpenList" listTitle="Open Projects" />
                </div>
            }

        </div>
      </section>
    )
  }
}

function mapStateToProps(state) {
  return {
    login: state.login,
  };
}

export default connect(mapStateToProps)(Projects);
