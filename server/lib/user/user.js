const ba = require('blockapps-rest');
const rest = ba.rest;
const util = ba.common.util;
const config = ba.common.config;

const contractName = 'User';
const contractFilename = `${config.libPath}/user/contracts/User.sol`;

const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;
const UserRole = rest.getEnums(`${config.libPath}/user/contracts/UserRole.sol`).UserRole;

function compileSearch() {
  return function(scope) {
    const searchable = [contractName];
    return rest.setScope(scope)
      .then(rest.compileSearch(searchable, contractName, contractFilename));
  }
}

function getState() {
  return function (scope) {
    return rest.setScope(scope)
      .then(rest.getState(contractName))
      .then(function (scope) {
        scope.result = scope.states[contractName];
        return scope;
      });
  }
}

function uploadContract(adminName, adminPassword, args) {
  return function(scope) {
    return rest.setScope(scope)
      .then(rest.getContractString(contractName, contractFilename))
      .then(rest.uploadContract(adminName, adminPassword, contractName, args))
      // .then(rest.waitNextBlock());
  }
}


function authenticate(adminName, pwHash) {
  return function(scope) {
    rest.verbose('authenticate', pwHash);
    // function authenticate(bytes32 _pwHash) return (bool) {
    const method = 'authenticate';
    const args = {
      _pwHash: pwHash,
    };

    return rest.setScope(scope)
      .then(rest.callMethod(adminName, contractName, method, args))
      .then(function(scope) {
        // returns bool
        const result = scope.contracts[contractName].calls[method];
        scope.result = (result == 'true');
        return scope;
      });
  }
}


module.exports = {
  compileSearch: compileSearch,
  getState: getState,
  uploadContract: uploadContract,
  // constants
  contractName: contractName,
  ErrorCodes: ErrorCodes,
  UserRole: UserRole,

  // business logic
  authenticate: authenticate,
};
