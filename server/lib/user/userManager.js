const ba = require('blockapps-rest');
const rest = ba.rest;
const util = ba.common.util;
const BigNumber = ba.common.BigNumber;
const config = ba.common.config;

const contractName = 'UserManager';
const contractFilename = `${config.libPath}/user/contracts/UserManager.sol`;

const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;
const UserRole = rest.getEnums(`${config.libPath}/user/contracts/UserRole.sol`).UserRole;
const userContractName = require('./user').contractName;

function compileSearch() {
  return function(scope) {
    const user = require('./user');
    const searchable = [contractName];
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

function getAccount(username, node) {
  return function (scope) {
    rest.verbose('getAccount', username);
    return rest.setScope(scope)
      .then(function(scope){
        return rest.getAccount(scope.users[username].address, node)(scope);
      })
      .then(function (scope) {
        scope.result = scope.accounts[scope.users[username].address][0];
        return scope;
      });
  }
}

function getBalance(username, node) {
  return function (scope) {
    rest.verbose('getBalance', username);
    return rest.setScope(scope)
      .then(getAccount(username, node))
      .then(function(scope){
        const account = scope.result;
        const balance = new BigNumber(account.balance);
        scope.result = balance;
        return scope;
      })
  }
}

// throws: ErrorCodes
// returns: user record from search
function createUser(adminName, username, password, role) {
  const pwHash = util.toBytes32(password); // FIXME this is not a hash
  return function(scope) {
    rest.verbose('createUser', {adminName, username, password, role});
    console.log(scope.users);
    // function createUser(string username, bytes32 pwHash) returns (ErrorCodes) {
    const method = 'createUser';
    const args = {
      username: username,
      pwHash: pwHash,
      role: role,
    };

    return rest.setScope(scope)
      // create eth account
      .then(rest.createUser(username, password))
      .then(function(scope) {
        // save the eth account
        args.account = scope.users[username].address;
        return scope;
      })
      // create the data user, with the eth account
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
        const address = scope.contracts[contractName].calls[method];
        // if not found
        if (address == 0) {
          scope.result = undefined;
          return scope;
        }
        // found - query for the full user record
        const trimmed = util.trimLeadingZeros(address); // FIXME leading zeros bug
        return rest.waitQuery(`${userContractName}?address=eq.${trimmed}`, 1)(scope)
          .then(function(scope) {
            const resultArray = scope.query.slice(-1)[0];
            scope.result = resultArray[0];
            return scope;
          });
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
        const trimmed = util.trimLeadingZeros(users); // FIXME leading zeros bug
        const csv = util.toCsv(trimmed); // generate csv string
        return rest.query(`${userContractName}?address=in.${csv}`)(scope);
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

module.exports = {
  compileSearch: compileSearch,
  getState: getState,
  uploadContract: uploadContract,
  getAccount: getAccount,
  getBalance: getBalance,

  createUser: createUser,
  exists: exists,
  getUser: getUser,
  getUsers: getUsers,
  login: login,
};
