import React, { Component } from 'react';
import Card from 'react-md/lib/Cards/Card';
import CardText from 'react-md/lib/Cards/CardText';
import Toolbar from 'react-md/lib/Toolbars';
import { FormattedNumber, FormattedDate } from 'react-intl';

class Detail extends Component {

  render() {
    const project = this.props.project;
    const fontSmall = {'fontSize': '14px'}
    const fontLarge = {'fontSize': '17px'}
    if (project && project.name) {
      return (
        <Card>
          <Toolbar
            themed
            title={"Detail"}
          />
          <CardText style={fontSmall}>
            <div className="md-grid">
              <div className="md-cell md-cell--12 md-body-1">
                <h6 className="md-title md-font-medium" style={fontLarge}>Description:</h6>
                {project.description ? project.description : '-'}
              </div>
            </div>
            <div className="md-grid">
              <div className="md-cell md-cell--12 md-body-1">
                <h6 className="md-title md-font-medium" style={fontLarge}>Desired price:</h6>
                {
                  project.price
                  ? <FormattedNumber
                      value={project.price}
                      style="currency" //eslint-disable-line
                      currency="USD" />
                  : ''
                }
              </div>
            </div>
            <div className="md-grid">
              <div className="md-cell md-cell--12 md-body-1">
                <h6 className="md-title md-font-medium" style={fontLarge}>Deliver by:</h6>
                {
                  project.targetDelivery
                  ? <FormattedDate
                      value={new Date(project.targetDelivery)}
                      day="numeric"
                      month="long"
                      year="numeric"/>
                  : ''
                }
              </div>
            </div>
            <div className="md-grid">
              <div className="md-cell md-cell--12 md-body-1">
                <h6 className="md-title md-font-medium" style={fontLarge}>Specification:</h6>
                {project.spec ? project.spec : '-'}
              </div>
            </div>
          </CardText>
        </Card>
      )
    }
    return (<span></span>)
  }
}

export default Detail;
