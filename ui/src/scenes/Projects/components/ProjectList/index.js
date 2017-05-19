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
import mixpanel from 'mixpanel-browser';

import { fetchProjectList } from './project-list.actions';

class ProjectList extends Component {

  componentWillMount() {
    const listType = this.props['listType'];
    this.props.fetchProjectList(listType, this.props.login['username']);
  }

  handleProjectClick = function(e, projectName) {
    e.stopPropagation();
    mixpanel.track('project_click');
    browserHistory.push(`/projects/${encodeURI(projectName)}`);
  };

  render() {

    const projects = this.props.projects;

    const projectRows = projects.length !== 0 ? projects.map(
      (project, index) =>
        <TableRow
          key={index}
          onClick={(e) => this.handleProjectClick(e, project.name)}
          style={{cursor: 'pointer'}}
        >
          <TableColumn>
            {
              project.created
              ? <FormattedDate
                  value={new Date(project.created)}
                  day="numeric"
                  month="long"
                  year="numeric" />
              : ''
            }

          </TableColumn>
          <TableColumn>
            {project.name ? project.name : ''}
          </TableColumn>
          <TableColumn>
            { project.price
              ? <FormattedNumber
                  value={project.price}
                  style="currency" //eslint-disable-line
                  currency="USD" />
              : ''
            }

          </TableColumn>
          <TableColumn>
            {
              project.targetDelivery
              ? <FormattedDate
                  value={new Date(project.targetDelivery)}
                  day="numeric"
                  month="long"
                  year="numeric" />
              : ''
            }
          </TableColumn>
          {/*<TableColumn>*/}
            {/*{*/}
              {/*project.deliveryAddress && project.deliveryAddress.city && project.deliveryAddress.state*/}
              {/*? project.deliveryAddress.city + ', ' + project.deliveryAddress.state*/}
              {/*: ''*/}
            {/*}*/}
          {/*</TableColumn>*/}
          <TableColumn>
            {project.state ? project.state : ''}
          </TableColumn>
        </TableRow>
    ):
    <TableRow>
      <TableColumn>
        <i> No projects to show! </i>
      </TableColumn>
    </TableRow>
    ;

    const projectsTable =
      <Card tableCard className="md-cell md-cell--12">
        <CardTitle title={this.props.listTitle} />
        <DataTable plain>
          <TableHeader>
            <TableRow autoAdjust={false}>
              <TableColumn>Created</TableColumn>
              <TableColumn>Name</TableColumn>
              <TableColumn>Desired Price</TableColumn>
              <TableColumn>Deliver by</TableColumn>
              {/*<TableColumn>Location</TableColumn>*/}
              <TableColumn>Status</TableColumn>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectRows}
          </TableBody>
        </DataTable>
      </Card>

    return (
      <div>
        {projectsTable}
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    projects: state.projects.projects[ownProps.listType],
    login: state.login,
  };
}

export default connect(mapStateToProps, { fetchProjectList })(ProjectList);
