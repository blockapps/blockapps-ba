const ba = require('blockapps-rest');
const rest = ba.rest;
const util = ba.common.util;
const config = ba.common.config;

const contractName = 'ProjectManager';
const contractFilename = `${config.libPath}/project/contracts/ProjectManager.sol`;

const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;
const projectContractName = require('./project').contractName;

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

// throws: ErrorCodes
// returns: record from search
function createProject(adminName, id, buyer) {
  return function(scope) {
    rest.verbose('createProject', {id, buyer});
    // function createPtoject(uint id, string buyer) returns (ErrorCodes) {
    const method = 'createPtoject';
    const args = {
      id: id,
      buyer: buyer,
    };

    return rest.setScope(scope)
      .then(rest.callMethod(adminName, contractName, method, args))
      .then(function(scope) {
        // returns (ErrorCodes)
        const errorCode = scope.contracts[contractName].calls[method];
        if (errorCode != ErrorCodes.SUCCESS) {
          const string = ErrorCodes[errorCode] || '';
          throw new Error(errorCode + ' ' + string + ' id:' + id);
        }
        return scope;
      })
      // get the contract data from search
      .then(getProject(adminName, id));
  }
}

function exists(adminName, id) {
  return function(scope) {
    rest.verbose('exists', id);
    // function exists(uint id) returns (bool) {
    const method = 'exists';
    const args = {
      id: id,
    };

    return rest.setScope(scope)
      .then(rest.callMethod(adminName, contractName, method, args))
      .then(function(scope) {
        // returns bool
        const exists = scope.contracts[contractName].calls[method];
        scope.result = (exists === 'true'); // return value is a string
        return scope;
      });
  }
}

function getProject(adminName, id) {
  return function(scope) {
    rest.verbose('getProject', id);
    // function getProject(string id) returns (address) {
    const method = 'getProject';
    const args = {
      id: id,
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
        // found - query for the full record
        return rest.waitQuery(`${projectContractName}?address=eq.${address}`, 1)(scope)
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
        const trimmed = trimArray(users); // trim leading zeros due to bug in cirrus
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

function trimArray(array) {
  return array.map(function(member) {
    return util.trimLeadingZeros(member);
  });
}


module.exports = {
  compileSearch: compileSearch,
  getState: getState,
  uploadContract: uploadContract,

  createProject: createProject,
  exists: exists,
  // getUser: getUser,
  // getUsers: getUsers,
  // login: login,
};
