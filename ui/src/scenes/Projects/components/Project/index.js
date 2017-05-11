import React, { Component } from 'react';
import { connect } from 'react-redux';
import Button from 'react-md/lib/Buttons/Button';
import Card from 'react-md/lib/Cards/Card';
import CardTitle from 'react-md/lib/Cards/CardTitle';
import CardText from 'react-md/lib/Cards/CardText';
import DataTable from 'react-md/lib/DataTables/DataTable';
import TableHeader from 'react-md/lib/DataTables/TableHeader';
import TableBody from 'react-md/lib/DataTables/TableBody';
import TableRow from 'react-md/lib/DataTables/TableRow';
import TableColumn from 'react-md/lib/DataTables/TableColumn';

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
      // let bidsRows = project.bids.map(
      //   bid =>
      //
      // );
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
              <div className="md-cell md-cell--12">
                <h4 className="md-title">Status:</h4>
                <span style={{'text-transform': 'capitalize'}}>{project.status}</span>
              </div>
            </div>
            <div className="md-grid">
              <div className="md-cell md-cell--12">
                <h4 className="md-title">Description:</h4>
                {project.description}
              </div>
            </div>
            <div className="md-grid">
              <div className="md-cell md-cell--12">
                <h4 className="md-title">Desired price:</h4>
                <FormattedNumber
                  value={project.priceDesired}
                  style="currency" //eslint-disable-line
                  currency="USD" />
              </div>
            </div>
            <div className="md-grid">
              <div className="md-cell md-cell--12">
                <h4 className="md-title ">Deliver by:</h4>
                <FormattedDate
                  value={new Date(project.desiredDeliveryDate)}
                  day="numeric"
                  month="long"
                  year="numeric"/>
              </div>
            </div>
            <div className="md-grid">
              <div className="md-cell md-cell--12">
                <h4 className="md-title ">Deliver address:</h4>
                {`${project.deliveryAddress.street}, ${project.deliveryAddress.city}, ${project.deliveryAddress.state}, ${project.deliveryAddress.zip}`}
              </div>
            </div>
            <div className="md-grid">
              <div className="md-cell md-cell--12">
                <h4 className="md-title ">Specs:</h4>
                <Button raised label="Download" href={project.specFileURL}>file_download</Button>
              </div>
            </div>
            { project.deliveredDate
              ? <div className="md-grid">
                  <div className="md-cell md-cell--12">
                    <h4 className="md-title ">Delivered on:</h4>
                    <FormattedDate
                      value={new Date(project.deliveredDate)}
                      day="numeric"
                      month="long"
                      year="numeric"/>, <FormattedTime value={new Date(project.deliveredDate)} />
                  </div>
                </div>
              : null
            }
            <div className="md-grid">
              <div className="md-cell md-cell--12">
                <h4 className="md-title ">Bids</h4>
                <DataTable plain>
                  <TableHeader>
                    <TableRow
                      // autoAdjust={false}
                    >
                      <TableColumn>Bid</TableColumn>
                      <TableColumn>Actions</TableColumn>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/*{BidsRows}*/}
                  </TableBody>
                </DataTable>
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
