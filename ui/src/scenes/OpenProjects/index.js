import React, { Component } from 'react';
import { connect } from 'react-redux';

import ProjectsList from '../Projects/components/ProjectsList';


class OpenProjects extends Component {

  render() {

    return (
      <section>
        <h2>Open Projects</h2>
        <div className="md-grid">
            {
              <div className="md-cell--12">
                <ProjectsList listType="open" listTitle="Open Projects" />
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

export default connect(mapStateToProps)(OpenProjects);
