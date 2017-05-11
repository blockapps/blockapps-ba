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
    const user = require('../user/user');
    const bid = require('../bid/bid');
    const project = require('./project');
    const searchable = [contractName];
    return rest.setScope(scope)
      .then(bid.compileSearch())
      .then(user.compileSearch())
      .then(project.compileSearch())
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
function createProject(adminName, name, buyer) {
  return function(scope) {
    rest.verbose('createProject', {name, buyer});
    // function createProject(string name, string buyer) returns (ErrorCodes) {
    const method = 'createProject';
    const args = {
      name: name,
      buyer: buyer,
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
      // get the contract data from search
      .then(getProject(adminName, name));
  }
}

// throws: ErrorCodes
// returns: record from search
function createBid(adminName, name, supplier, amount) {
  return function(scope) {
    rest.verbose('createBid', {name, supplier, amount});
    // function createBid(string name, string supplier, uint amount) returns (ErrorCodes, uint) {
    const method = 'createBid';
    const args = {
      name: name,
      supplier: supplier,
      amount: amount,
    };

    return rest.setScope(scope)
      .then(rest.callMethod(adminName, contractName, method, args))
      .then(function(scope) {
        // returns (ErrorCodes, uint)
        const tuppleString = scope.contracts[contractName].calls[method];
        const tuppleArray = tuppleString.split(',');
        const errorCode = tuppleArray[0];
        const bidId = tuppleArray[1];

        if (errorCode != ErrorCodes.SUCCESS) {
          throw new Error(errorCode);
        }
        // block until the contract shows up in search
        return rest.waitQuery(`Bid?id=eq.${bidId}`, 1)(scope)
          .then(function(scope) {
            const resultArray = scope.query.slice(-1)[0];
            scope.result = resultArray[0];
            return scope;
          })
      });
  }
}

function getBid(bidId) {
  return function(scope) {
    rest.verbose('getBid', bidId);
    return rest.query(`Bid?id=eq.${bidId}`)(scope);
  }
}

function exists(adminName, name) {
  return function(scope) {
    rest.verbose('exists', name);
    // function exists(string name) returns (bool) {
    const method = 'exists';
    const args = {
      name: name,
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

function getProject(adminName, name) {
  return function(scope) {
    rest.verbose('getProject', name);
    // function getProject(string name) returns (address) {
    const method = 'getProject';
    const args = {
      name: name,
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
        const trimmed = util.trimLeadingZeros(address); // FIXME leading zeros bug
        return rest.waitQuery(`${projectContractName}?address=eq.${trimmed}`, 1)(scope)
          .then(function(scope) {
            const resultArray = scope.query.slice(-1)[0];
            scope.result = resultArray[0];
            return scope;
          });
      });
  }
}

function getProjects(adminName) {
  return function(scope) {
    rest.verbose('getProjects');

    return rest.setScope(scope)
      .then(rest.getState(contractName))
      .then(function (scope) {
        const state = scope.states[contractName];
        const projects = state.projects;
        const trimmed = trimArray(projects); // FIXME leading zeros bug
        const csv = util.toCsv(trimmed); // generate csv string
        return rest.query(`${projectContractName}?address=in.${csv}`)(scope);
      })
      .then(function (scope) {
        scope.result = scope.query.slice(-1)[0];
        return scope;
      });
  }
}

function handleEvent(adminName, name, projectEvent) {
  return function(scope) {
    rest.verbose('handleEvent', {name, projectEvent});

    const method = 'handleEvent';

    return rest.setScope(scope)
      .then( getProject(adminName, name) )
      .then(function (scope) {
        // function handleEvent(address projectAddress, ProjectEvent projectEvent) returns (ErrorCodes, ProjectState) {
        const projectAddress = scope.result.address;
        const args = {
          projectAddress: projectAddress,
          projectEvent: projectEvent,
        };
        return rest.callMethod(adminName, contractName, method, args)(scope);
      })
      .then(function(scope) {
        // returns (ErrorCodes, ProjectState)
        const tupleString = scope.contracts[contractName].calls[method];
        const tupleArray = tupleString.split(',');
        scope.result = {errorCode: tupleArray[0], state: tupleArray[1]};
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
  createBid: createBid,
  exists: exists,
  getBid: getBid,
  getProject: getProject,
  getProjects: getProjects,
  handleEvent: handleEvent,
};
