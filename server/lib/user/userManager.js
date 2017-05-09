const ba = require('blockapps-rest');
const rest = ba.rest;
const util = ba.common.util;
const config = ba.common.config;

const contractName = 'UserManager';
const contractFilename = `${config.libPath}/user/contracts/UserManager.sol`;

const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;

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

function createUser(adminName, username, pwHash) {
  return function(scope) {
    rest.verbose('createUser', username, pwHash);
    // function createUser(string username, bytes32 pwHash) returns (ErrorCodes) {
    const method = 'createUser';
    const args = {
      username: username,
      pwHash: pwHash,
    };

    return rest.setScope(scope)
      .then(rest.callMethod(adminName, contractName, method, args))
      .then(function(scope) {
        // returns ErrorCodes
        const result = scope.contracts[contractName].calls[method];
        if (result != ErrorCodes.SUCCESS) {
          throw new Error(result);
        }
        // store new user
        if (scope.users[username] === undefined) scope.users[username] = {};
        return scope;
      });
  }
}

function exists(adminName, username) {
  return function(scope) {
    rest.verbose('exists', username);
    // function exists(string username) returns (bool) {
    const method = 'exists';
    const args = {
      username: username,
    };

    return rest.setScope(scope)
      .then(rest.callMethod(adminName, contractName, method, args))
      .then(function(scope) {
        // returns bool
        const result = scope.contracts[contractName].calls[method];
        scope.result = (result === 'true'); // return value is a string
        return scope;
      });
  }
}

function getUser(adminName, username) {
  return function(scope) {
    rest.verbose('getUser', username);
    // function getUser(string username) returns (address) {
    const method = 'getUser';
    const args = {
      username: username,
    };

    return rest.setScope(scope)
      .then(rest.callMethod(adminName, contractName, method, args))
      .then(function(scope) {
        // returns address
        const result = scope.contracts[contractName].calls[method];
        scope.result = result;
        return scope;
      });
  }
}

function getUsers(adminName) {
  return function(scope) {
    rest.verbose('getUsers');

    return rest.setScope(scope)
      .then(rest.getState(contractName))
      .then(function (scope) {
        const state = scope.states[contractName];
        const users = state.users;
        const trimmed = trimArray(users); // trim leading zeros due to bug in cirrus
        const csv = util.toCsv(trimmed); // generate csv string
        return rest.query(`User?address=in.${csv}`)(scope);
      })
      .then(function (scope) {
        scope.result = scope.query.slice(-1)[0];
        return scope;
      });
  }
}

function login(adminName, username, password) {
  return function(scope) {
    rest.verbose('login', username, password);
    scope.user = {
      username: 'Supplier1',
      role: 'Supplier'
    };
    return scope;
  }
}


function trimArray(array) {
  return array.map(function(member) {
    return util.trimLeadingZeros(member);
  });
}


module.exports = {
  compileSearch: compileSearch,
  getState: getState,
  uploadContract: uploadContract,

  createUser: createUser,
  exists: exists,
  getUser: getUser,
  getUsers: getUsers,
  login: login,
};
