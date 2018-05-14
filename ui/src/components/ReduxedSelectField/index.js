import React from "react";
import SelectField from "react-md/lib/SelectFields";

const ReduxedSelectField = ({ input, meta: { touched, error }, ...others }) => (
  <SelectField
    {...input}
    {...others}
    error={touched && !!error}
    errorText={error}
  />
);

export default ReduxedSelectField;
