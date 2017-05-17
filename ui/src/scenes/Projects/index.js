import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import Button from 'react-md/lib/Buttons/Button';
import Toolbar from 'react-md/lib/Toolbars';
import ProjectList from './components/ProjectList';

class Projects extends Component {

  handleNewProjectClick = function(e) {
    e.stopPropagation();
    browserHistory.push(`/projects/create`);
  };

  // TODO: move to common place
  get isBuyer() {
    return this.props.login['role'] === 'BUYER'
  }

  render() {
    const actions = this.isBuyer
      ?
      <Button
        flat
        key="add_circle_outline"
        label="Create New Project"
        onClick={(e) => this.handleNewProjectClick(e)}>
          add_circle_outline
        </Button>
      :
      '';

    const projectView = this.isBuyer
      ?
      <div className="md-grid">
        <div className="md-cell md-cell--12">
          <ProjectList listType="buyer" listTitle="My Projects" />
        </div>
      </div>
      :
      <div className="md-grid">
        <div className="md-cell md-cell--12">
          <ProjectList listType="supplier" listTitle="My Bids" />
        </div>
        <div className="md-cell md-cell--12">
          <ProjectList listType="open" listTitle="Open Projects" />
        </div>
      </div>;

    return (
      <section>
        <Toolbar
          themed
          title="Projects"
          actions={actions}
        />
        {projectView}
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
