export function validate(values) {
  const errors = {};

  if (!values.name) {
    errors.name = "Please enter entity name";
  }

  if (!values.eNodeUrl) {
    errors.eNodeUrl = "Please enter node URL";
  }

  if (!values.adminEthereumAddress) {
    errors.adminEthereumAddress = "Please enter etherium address";
  }

  if (!values.adminName) {
    errors.adminName = "Please enter admin name";
  }

  if (!values.adminEmail) {
    errors.adminEmail = "Please enter admin email";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.adminEmail)) {
    errors.adminEmail = 'Please enter a valid admin email';
  }

  if (!values.tokenAmount) {
    errors.tokenAmount = "Please enter token amount";
  }

  return errors;
}