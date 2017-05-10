const ba = require('blockapps-rest');
const rest = ba.rest;
const util = ba.common.util;
const config = ba.common.config;

const contractName = 'UserManager';
const contractFilename = `${config.libPath}/user/contracts/UserManager.sol`;

const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;
const UserRole = rest.getEnums(`${config.libPath}/user/contracts/UserRole.sol`).UserRole;

function compileSearch() {
  return function(scope) {
    const searchable = [contractName];
    const user = require('./user');
    return rest.setScope(scope)
      .then(user.compileSearch())
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

// throws: ErrorCodes
// returns: user record from search
function createUser(adminName, username, pwHash, role) {
  return function(scope) {
    rest.verbose('createUser', username, pwHash);
    // function createUser(string username, bytes32 pwHash) returns (ErrorCodes) {
    const method = 'createUser';
    const args = {
      username: username,
      pwHash: pwHash,
      role: role,
    };

    return rest.setScope(scope)
      .then(rest.callMethod(adminName, contractName, method, args))
      .then(function(scope) {
        // returns (ErrorCodes)
        const errorCode = scope.contracts[contractName].calls[method];
        if (errorCode != ErrorCodes.SUCCESS) {
          throw new Error(errorCode);
        }
        return scope;
      })
      .then(getUser(adminName, username))
      .then(function(scope) {
        const user = scope.result;
        // store new user
        scope.users[username] = {address: user.address};
        return scope;
      })
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
        return rest.waitQuery(`User?address=eq.${result}`, 1)(scope);
      })
      .then(function(scope) {
        const resultArray = scope.query.slice(-1)[0];
        // none found
        if (resultArray.length === 0) {
          scope.result = undefined;
          return scope;
        }
        // error - multiple found
        if (resultArray.length > 1) {
          throw new Error('Multiple entries for username ' + username);
        }
        // OK - 1 user found
        scope.result = resultArray[0];
        return scope;
      })
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
    rest.verbose('login', {username, password});

    // function login(string username, password) returns (bool) {
    const method = 'login';
    const args = {
      username: username,
      pwHash: util.toBytes32(password),
    };

    return rest.setScope(scope)
      // login
      .then(rest.callMethod(adminName, contractName, method, args))
      .then(function(scope) {
        // returns bool
        const result = scope.contracts[contractName].calls[method];
        scope.result = (result == 'true');
        return scope;
      });
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
