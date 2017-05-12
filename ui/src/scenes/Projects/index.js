import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Button from 'react-md/lib/Buttons/Button';

import ProjectsList from './components/ProjectsList';

class Projects extends Component {

  handleNewProjectClick = function(e) {
    e.stopPropagation();
    browserHistory.push(`/projects/create`);
  };

  render() {

    return (
      <section>
        <h2>Projects</h2>
        <div className="md-grid">
          <div className="md-cell">
            <Button flat primary label="New Project" onClick={(e) => this.handleNewProjectClick(e)}>add_circle</Button>
          </div>
          <div className="md-cell--12">
            <ProjectsList listType="buyerList" listTitle="My Projects" />
          </div>
        </div>
      </section>
    )
  }
}

export default (Projects);
