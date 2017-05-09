


function login(adminName, username, password) {
  return function(scope) {
    scope.user = {
      username: 'Supplier1',
      role: 'Supplier'
    }
    return scope;
  }
}

module.exports = function(_contractsPath) {
  contractsPath = _contractsPath;
  return {
    login: login
  };
}
