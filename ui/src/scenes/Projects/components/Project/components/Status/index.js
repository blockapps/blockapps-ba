import React, { Component } from 'react';
import Card from 'react-md/lib/Cards/Card';
import CardText from 'react-md/lib/Cards/CardText';
import Toolbar from 'react-md/lib/Toolbars';

class Status extends Component {
  render() {
    return (
      <Card>
        <Toolbar
          themed
          title={"Status"}
        />
      </Card>
    )
  }
}

export default Status;
