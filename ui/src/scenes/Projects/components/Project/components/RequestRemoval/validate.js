export const validate = (values) => {
  const errors = {};

  if (!values.entityID) {
    errors.entityID = 'Please select entity';
  }

  if (!values.entity) {
    errors.entity = 'Please removal for';
  }

  if (!values.password) {
    errors.password = 'Please enter a password';
  }

  return errors;
};

export default validate;
