const ba = require('blockapps-rest');
const rest = ba.rest;
const util = ba.common.util;
const config = ba.common.config;

const contractName = 'User';
const contractFilename = `${config.libPath}/user/contracts/User.sol`;

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


function test32(adminName) {
  return function (scope) {
    // function test(string s, bytes32 b) returns(bool) {
    const method = 'test';
    const args = {
      s: 'abcd',
      b: util.toBytes32('abcd'),
    };
    return rest.setScope(scope)
      .then(rest.callMethod(adminName, contractName, method, args))
      .then(function (scope) {
        scope.result = scope.contracts[contractName].calls[method];
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>', scope.result);
        return scope;
      })
  }
}



module.exports = {
  compileSearch: compileSearch,
  getState: getState,
  uploadContract: uploadContract,
  test32: test32,
};
