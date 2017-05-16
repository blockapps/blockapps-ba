import React, { Component } from 'react';
import Card from 'react-md/lib/Cards/Card';
import CardText from 'react-md/lib/Cards/CardText';
import Toolbar from 'react-md/lib/Toolbars';

class Bids extends Component {
  render() {
    return (
      <Card>
        <Toolbar
          themed
          title={"Bids"}
        />
      </Card>
    )
  }
}

export default Bids;
