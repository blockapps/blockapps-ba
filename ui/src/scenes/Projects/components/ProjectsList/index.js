import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { FormattedNumber, FormattedDate } from 'react-intl';

import Card from 'react-md/lib/Cards/Card';
import CardTitle from 'react-md/lib/Cards/CardTitle';
import DataTable from 'react-md/lib/DataTables/DataTable';
import TableHeader from 'react-md/lib/DataTables/TableHeader';
import TableBody from 'react-md/lib/DataTables/TableBody';
import TableRow from 'react-md/lib/DataTables/TableRow';
import TableColumn from 'react-md/lib/DataTables/TableColumn';

import { fetchProjectsList } from './projectsList.actions';

class ProjectsList extends Component {

  componentWillMount() {
    const listType = this.props['listType'];
    console.log('>>>>>', listType);
    this.props.fetchProjectsList();
  }

  handleProjectClick = function(e, projectId) {
    e.stopPropagation();
    browserHistory.push(`/projects/${projectId}`);
  };

  render() {
    let projectsTable;

    if (this.props.projects.length > 0) {
      const projectRows = this.props.projects.map(
        (project, index) =>
          <TableRow
            key={index}
            onClick={(e) => this.handleProjectClick(e, project.id)}
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

      projectsTable =
        <Card tableCard className="md-cell md-cell--12">
          <CardTitle title={this.props.listTitle} />
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
      <div>
        {projectsTable}
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    projects: state.projects.projects
  };
}

export default connect(mapStateToProps, { fetchProjectsList })(ProjectsList);
