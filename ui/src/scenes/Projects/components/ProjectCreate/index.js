import React, { Component } from 'react';
import { connect } from 'react-redux';
import Button from 'react-md/lib/Buttons/Button';
import Card from 'react-md/lib/Cards/Card';
import CardText from 'react-md/lib/Cards/CardText';
import CardTitle from 'react-md/lib/Cards/CardTitle';
import { reduxForm, Field } from 'redux-form';
import { projectCreate } from './actions/project-create.actions';
import ReduxedTextField from '../../../../components/ReduxedTextField/';
import { Link } from 'react-router';
import './ProjectCreate.css';


class ProjectCreate extends Component {

  submit = (values) => {
    this.props.projectCreate(
      {
        name: values['name'],
        buyer: this.props.login['username'],
        description: values['description'],
        spec: values['spec'],
        price: values['price'], // todo: allow cents and send x100 int to API
        targetDelivery: +new Date(values['targetDelivery']),
        addressStreet: values['addressStreet'],
        addressCity: values['addressCity'],
        addressState: values['addressState'],
        addressZip: values['addressZip'],
      }
    );
  };

  render() {
    const {handleSubmit} = this.props;

    return (
      <section>
        <div className="md-grid">
          <div className="md-cell md-cell--3-desktop md-cell--2-tablet md-cell--phone-hidden" />
          <Card className="md-cell md-cell--6-desktop md-cell--8-tablet md-cell--12-phone">
            <CardTitle
              title="New Project"
            />
            <CardText>
              <form onSubmit={handleSubmit(this.submit)}>
                <div className="md-grid">
                  <Field
                    id="name"
                    name="name"
                    type="text"
                    label="Short name"
                    required
                    maxLength={100}
                    className="md-cell md-cell--12"
                    component={ReduxedTextField} />
                  <Field
                    id="description"
                    name="description"
                    type="text"
                    label="Description"
                    required
                    className="md-cell md-cell--12"
                    component={ReduxedTextField} />
                  <Field
                    id="price"
                    name="price"
                    type="number"
                    label="Desired price"
                    min="1"
                    step="1"
                    required
                    className="md-cell md-cell--12"
                    component={ReduxedTextField} />
                  <Field
                    id="targetDelivery"
                    name="targetDelivery"
                    label="Desired delivery date"
                    className="md-cell md-cell--12"
                    required
                    type="date" // ignore the console warnings, todo: implement Date Picker with redux form
                    component={ReduxedTextField}
                  />
                  {/*<Field*/}
                    {/*id="addressStreet"*/}
                    {/*name="addressStreet"*/}
                    {/*type="text"*/}
                    {/*label="Street"*/}
                    {/*className="md-cell--4"*/}
                    {/*component={ReduxedTextField} />*/}
                  {/*<div className="md-cell--12" />*/}
                  {/*<Field*/}
                    {/*id="addressCity"*/}
                    {/*name="addressCity"*/}
                    {/*type="text"*/}
                    {/*label="City"*/}
                    {/*className="md-cell--4"*/}
                    {/*component={ReduxedTextField} />*/}
                  {/*<div className="md-cell--12" />*/}
                  {/*<Field*/}
                    {/*id="addressState"*/}
                    {/*name="addressState"*/}
                    {/*type="text"*/}
                    {/*label="State"*/}
                    {/*maxLength={2}*/}
                    {/*className="md-cell--4"*/}
                    {/*component={ReduxedTextField} />*/}
                  {/*<div className="md-cell--12" />*/}
                  {/*<Field*/}
                    {/*id="addressZip"*/}
                    {/*name="addressZip"*/}
                    {/*type="text"*/}
                    {/*label="Zip code"*/}
                    {/*maxLength={5}*/}
                    {/*className="md-cell--4"*/}
                    {/*component={ReduxedTextField} />*/}
                  <Field
                    id="spec"
                    name="spec"
                    type="text"
                    label="Specification"
                    maxLength={1000}
                    required
                    rows={6}
                    className="md-cell md-cell--12"
                    component={ReduxedTextField} />
                  <div className="md-cell md-cell--12" />
                  <div className="md-cell md-cell--12 md-text-right">
                    <Button raised primary label="Create" type="submit" />
                    <Link to="/projects">
                      <Button className="margin-left" raised label="Cancel" />
                    </Link>
                  </div>
                </div>
              </form>
            </CardText>
          </Card>
        </div>
      </section>
    );
  }
}

function mapStateToProps(state) {
  return {
    project: state.project,
    login: state.login,
  };
}

const connected = connect(mapStateToProps, { projectCreate })(ProjectCreate);

const formedComponent = reduxForm({ form: 'project-create'})(connected);

export default formedComponent;
