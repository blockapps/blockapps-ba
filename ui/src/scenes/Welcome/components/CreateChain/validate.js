export default function validate(values) {
  let errors = {};

  if (!values.chain_name) {
    errors.chain_name = "Required"
  }
  if (!values['users'] || !values.users.length) {
    errors.users = { error: 'At least one member must be entered' }
  } else {
    const userArrayErrors = []
    values.users.forEach((user, index) => {
      const error = {};
      if (!user || !user.address) {
        error.address = 'Required'
        userArrayErrors[index] = error
      }
      if (!user || !user.balance) {
        error.balance = 'Required'
        userArrayErrors[index] = error
      }
      if (!user || !user.role) {
        error.role = 'Required'
        userArrayErrors[index] = error
      }
      return userArrayErrors;
    })
    if(userArrayErrors.length) {
      errors.users = userArrayErrors
    }
  }
  
  return errors;
}