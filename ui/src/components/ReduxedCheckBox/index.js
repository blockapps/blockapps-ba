import React from "react";
import Checkbox from "react-md/lib/SelectionControls/Checkbox";

const ReduxedCheckBox = ({ input, meta: { touched, error }, ...others }) => (
  <Checkbox
    {...input}
    {...others}
  />
);

export default ReduxedCheckBox;
