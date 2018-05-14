export const validate = values => {
  let errors = {};

  if (!values.consortium) {
    errors.consortium = "Select consortium";
  }

  if (!values.username) {
    errors.username = "Please enter a username";
  }

  if (!values.password) {
    errors.password = "Please enter a password";
  }

  return errors;
};
