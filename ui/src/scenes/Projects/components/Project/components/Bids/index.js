import React, { Component } from 'react';
import Card from 'react-md/lib/Cards/Card';
import Toolbar from 'react-md/lib/Toolbars';
import BidTable from './components/BidTable/';

class Bids extends Component {
  render() {
    const project = this.props.project;
    let bidTable;
    if(project && project.name && project.state) {
      bidTable = <BidTable bids={this.props.bids} projectState={project.state} />
    }

    return (
      <Card>
        <Toolbar
          themed
          title={"Bids"}
        />
        {bidTable}
      </Card>
    )
  }
}

export default Bids;
