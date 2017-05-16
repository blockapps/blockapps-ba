import React, { Component } from 'react';
import Card from 'react-md/lib/Cards/Card';
import CardText from 'react-md/lib/Cards/CardText';
import Toolbar from 'react-md/lib/Toolbars';

class Detail extends Component {
  render() {
    const project = this.props.project;
    return (
      <Card>
        <Toolbar
          themed
          title={"Detail"}
        />
      
      </Card>
    )
  }
}

export default Detail;
