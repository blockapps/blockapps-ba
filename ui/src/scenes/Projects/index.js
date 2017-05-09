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

import { fetchProjects } from './projects.actions';


class Projects extends Component {

  componentWillMount() {
    this.props.fetchProjects();
  }

  // componentDidMount() {
  //   this.startPoll();
  // }

  // componentWillUnmount() {
  //   clearTimeout(this.timeout)
  // }

  // startPoll() {
    // //console.log('startPoll', this.props);
    // const dashboardFetchStatus = this.props.dashboardFetchStatus;
    // this.timeout = setInterval(function() { dashboardFetchStatus(); }, POLL_INTERVAL);
  // }

  render() {

    function handleProjectClick(e, projectId) {
      e.stopPropagation();
      browserHistory.push(`/projects/${projectId}`);
    }

    let projects = [];
    this.props.projects.forEach(function(project,i) {
      projects.push(project)
    });

    const projectRows = this.props.projects.map(function(project, index) {
      return <TableRow key={index}
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
          <FormattedNumber value={project.priceDesired} style={"currency"} currency="USD" />
        </TableColumn>
        <TableColumn>
          <FormattedDate
            value={new Date(project.desiredDeliveryDate)}
            day="numeric"
            month="long"
            year="numeric" />
        </TableColumn>
        <TableColumn>{project.deliveryAddress.city}, {project.deliveryAddress.state}</TableColumn>
        <TableColumn>{project.status.name}</TableColumn>
      </TableRow>
    });

    return (
      <section>
        <div className="md-headline">Projects</div>
        <div className="md-grid">
          <Card tableCard className="mde-cell md-cell--12">
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
