import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import Button from 'react-md/lib/Buttons/Button';

import ProjectsList from './components/ProjectsList';

// TODO: remove
import Card from 'react-md/lib/Cards/Card';
import CardTitle from 'react-md/lib/Cards/CardTitle';
import DataTable from 'react-md/lib/DataTables/DataTable';
import TableHeader from 'react-md/lib/DataTables/TableHeader';
import TableBody from 'react-md/lib/DataTables/TableBody';
import TableRow from 'react-md/lib/DataTables/TableRow';
import TableColumn from 'react-md/lib/DataTables/TableColumn';



class Projects extends Component {

  handleNewProjectClick = function(e) {
    e.stopPropagation();
    browserHistory.push(`/projects/create`);
  };

  // TODO: move to common place
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
                  {/*TODO: second list prevents the first to fetch data - repair it. */}
                  {/*<ProjectsList listType="supplierBidsList" listTitle="Projects bidded by me" />*/}
                  {/*TODO: Just for demo. To be removed*/}
                  <Card tableCard className="md-cell md-cell--12">
                    <CardTitle title="Projects bidded by me" />
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
                        {[]}
                      </TableBody>
                    </DataTable>
                  </Card>

                  <div className="md-cell--12" />
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
