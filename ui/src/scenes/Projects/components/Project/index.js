import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
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

import { fetchProject } from './actions/project.actions';

class Project extends Component {

  componentWillMount() {
    this.props.fetchProject(this.props.params['pname']); //todo: html encode url
  }

  render() {
    let projectContent;

    if (this.props.project) {
      const project = this.props.project;
      let bidsRows;
      console.log('>>>> project >>>>', project);
      if (project.bids) {
        bidsRows = project.bids.map(
          (bid,i) =>
            <TableRow key={"bid"+i}>
              <TableColumn>
                <FormattedNumber
                  value={bid.price}
                  style="currency" //eslint-disable-line
                  currency="USD" />
              </TableColumn>
              <TableColumn>
                {/*todo: show accept buttons only if no accepted bid yet*/}
                {/*{ project.accepted ?*/}
                {/*<span>*/}
                {/*<h2>{ `Welcome Back ${ this.props.name }` }</h2>*/}
                {/*<p>You can visit settings to reset your password</p>*/}
                {/*</span>*/}
                {/*:*/}
                {/*null*/}
                {/*}*/}
                <span style={{whiteSpace: "normal"}}>
                {bid.planDescription}
              </span>
              </TableColumn>
              <TableColumn>
                <Button primary flat label="Accept">check_circle</Button> {/*todo: onClick= accept bid*/}
              </TableColumn>
            </TableRow>
        );
      }
      projectContent =
        <Card className="md-cell md-cell--12">
          <CardTitle
            title={project.name ? project.name : ''}
            // subtitle={
            //   <span>
            //     {/*<FormattedDate*/}
            //       {/*value={new Date(project.created)}*/}
            //       {/*day="numeric"*/}
            //       {/*month="long"*/}
            //       {/*year="numeric"/>, <FormattedTime value={new Date(project.created)} />*/}
            //   </span>
            // }
          />
          <CardText>
            <div className="md-grid">
              <div className="md-cell md-cell--12">
                <h4 className="md-title">Status:</h4>
                <span style={{'textTransform': 'capitalize'}}>
                  {project.state ? project.state : ''}
                  </span>
              </div>
            </div>
            <div className="md-grid">
              <div className="md-cell md-cell--12">
                <h4 className="md-title">Description:</h4>
                {project.description ? project.description : ''}
              </div>
            </div>
            <div className="md-grid">
              <div className="md-cell md-cell--12">
                <h4 className="md-title">Desired price:</h4>
                {/*<FormattedNumber*/}
                  {/*value={project.priceDesired}*/}
                  {/*style="currency" //eslint-disable-line*/}
                  {/*currency="USD" />*/}
              </div>
            </div>
            <div className="md-grid">
              <div className="md-cell md-cell--12">
                <h4 className="md-title ">Deliver by:</h4>
                {/*<FormattedDate*/}
                  {/*value={new Date(project.desiredDeliveryDate)}*/}
                  {/*day="numeric"*/}
                  {/*month="long"*/}
                  {/*year="numeric"/>*/}
              </div>
            </div>
            <div className="md-grid">
              <div className="md-cell md-cell--12">
                <h4 className="md-title ">Deliver address:</h4>
                {/*{`${project.deliveryAddress.street}, ${project.deliveryAddress.city}, ${project.deliveryAddress.state}, ${project.deliveryAddress.zip}`}*/}
              </div>
            </div>
            <div className="md-grid">
              <div className="md-cell md-cell--12">
                <h4 className="md-title ">Specification:</h4>
                {project.spec ? project.spec : ''}
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
              <div className="md-cell md-cell--11">
                <h4 className="md-title ">Bids</h4>
              </div>
              <div className="md-cell md-cell--1">
                <Link className="md-cell--right" to={'/projects/' + project.name + "/bid"}>
                  <Button raised primary label="Add Bid" />
                </Link>
              </div>
              <div className="md-cell md-cell--12">
                <DataTable plain>
                  <TableHeader>
                    <TableRow
                      // autoAdjust={false}
                    >
                      <TableColumn>Bid</TableColumn>
                      <TableColumn>Specs</TableColumn>
                      <TableColumn>Actions</TableColumn>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bidsRows}
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
    );
  }
}

function mapStateToProps(state) {
  return {
    project: state.project.project
  };
}

export default connect(mapStateToProps, { fetchProject })(Project);
