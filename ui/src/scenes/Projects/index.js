import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { FormattedNumber, FormattedDate } from 'react-intl';

import Button from 'react-md/lib/Buttons/Button';
import Card from 'react-md/lib/Cards/Card';
import CardTitle from 'react-md/lib/Cards/CardTitle';
import DataTable from 'react-md/lib/DataTables/DataTable';
import TableHeader from 'react-md/lib/DataTables/TableHeader';
import TableBody from 'react-md/lib/DataTables/TableBody';
import TableRow from 'react-md/lib/DataTables/TableRow';
import TableColumn from 'react-md/lib/DataTables/TableColumn';

import { fetchProjects } from './projects.actions';

class Projects extends Component {

  componentWillMount() {
    this.props.fetchProjects();
  }

  render() {
    let myProjectsTable;

    let handleProjectClick = function(e, projectId) {
      e.stopPropagation();
      browserHistory.push(`/projects/${projectId}`);
    };

    if (this.props.projects.length > 0) {
      const projectRows = this.props.projects.map(
        (project, index) =>
          <TableRow
            key={index}
            onClick={(e) => handleProjectClick(e, project.id)}
            style={{cursor: 'pointer'}}
          >
            <TableColumn>
              <FormattedDate
                value={new Date(project.created)}
                day="numeric"
                month="long"
                year="numeric" />
            </TableColumn>
            <TableColumn>{project.name}</TableColumn>
            <TableColumn>
              <FormattedNumber
                value={project.priceDesired}
                style="currency" //eslint-disable-line
                currency="USD" />
            </TableColumn>
            <TableColumn>
              <FormattedDate
                value={new Date(project.desiredDeliveryDate)}
                day="numeric"
                month="long"
                year="numeric" />
            </TableColumn>
            <TableColumn>{project.deliveryAddress.city}, {project.deliveryAddress.state}</TableColumn>
            <TableColumn>{project.status}</TableColumn>
          </TableRow>
      );

      myProjectsTable =
        <Card tableCard className="md-cell md-cell--12">
          <CardTitle title="My Projects" />
          <DataTable plain>
            <TableHeader>
              <TableRow autoAdjust={false}>
                <TableColumn>Created</TableColumn>
                <TableColumn>Name</TableColumn>
                <TableColumn>Desired Price</TableColumn>
                <TableColumn>Deliver by</TableColumn>
                <TableColumn>Location</TableColumn>
                <TableColumn>Status</TableColumn>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectRows}
            </TableBody>
          </DataTable>
        </Card>
    }


    return (
      <section>
        <h2>Projects</h2>
        <div className="md-grid">
          <div className="md-cell">
            <Button flat primary label="New Project">add_circle</Button>
          </div>
          {myProjectsTable}
        </div>
      </section>
    )
  }
}

function mapStateToProps(state) {
  return {
    projects: state.projects.projects
  };
}

export default connect(mapStateToProps, { fetchProjects })(Projects);
