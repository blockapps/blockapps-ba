const ba = require('blockapps-rest');
const rest = ba.rest;
const util = ba.common.util;
const config = ba.common.config;
const Promise = ba.common.Promise;

const contractName = 'ProjectManager';
const contractFilename = `${config.libPath}/project/contracts/ProjectManager.sol`;

const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;
const ProjectState = ba.rest.getEnums(`${config.libPath}/project/contracts/ProjectState.sol`).ProjectState;
const ProjectEvent = ba.rest.getEnums(`${config.libPath}/project/contracts/ProjectEvent.sol`).ProjectEvent;
const BidState = ba.rest.getEnums(`${config.libPath}/bid/contracts/BidState.sol`).BidState;
const projectContractName = require('./project').contractName;

function* compileSearch(onlyIfNotCompiled) {
  // if only first time, but alreay compiled - bail
  if (onlyIfNotCompiled  &&  (yield isCompiled())) {
    return;
  }
  // compile dependencies
  const bid = require('../bid/bid');
  yield bid.compileSearch();
  const user = require('../user/user');
  yield user.compileSearch();
  const project = require('./project');
  yield project.compileSearch();
  // compile
  const searchable = [contractName];
  return yield rest.compileSearch(searchable, contractName, contractFilename);
}

function* getState(contract) {
  return yield rest.getState(contract);
}

function* uploadContract(user, args) {
  return yield rest.uploadContract(user, contractName, contractFilename, args);
}

function* isCompiled() {
  return yield rest.isCompiled(contractName);
}

// throws: ErrorCodes
// returns: record from search
function* createProject(buyer, contract, args) {
  rest.verbose('createProject', {buyer, args});
  // function createProject(
  //   string name,
  //   string buyer,
  //   string description,
  //   string spec,
  //   uint price,
  //   uint created,
  //   uint targetDelivery
  // ) returns (ErrorCodes) {
  const method = 'createProject';

  const result = yield rest.callMethod(buyer, contract, method, args);
  const errorCode = parseInt(result[0]);
  if (errorCode != ErrorCodes.SUCCESS) {
    throw new Error(errorCode);
  }
  // get the contract data from search
  const project = yield getProject(buyer, contract, args.name);
  return project;
}

// throws: ErrorCodes
// returns: record from search
function createBid(buyer, name, supplier, amount) {
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
      .then(rest.callMethod(buyer, contractName, method, args))
      .then(function(scope) {
        // returns (ErrorCodes, uint)
        const result = scope.contracts[contractName].calls[method];
        const errorCode = parseInt(result[0]);
        const bidId = result[1];

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

// throws: ErrorCodes
function acceptBid(buyer, bidId, name) {
  return function(scope) {
    rest.verbose('acceptBid', {buyer, bidId, name});
    return rest.setScope(scope)
      .then(getBidsByName(name))
      .then(function(scope) {
        const bids = scope.result;

        return Promise.each(bids, function(bid) { // for each bid
          // accept the selected bid - reject the others
          if (bid.id == bidId) {
            return setBidState(buyer, bid.address, BidState.ACCEPTED, bid.amount)(scope); // ACCEPT
          } else {
            return setBidState(buyer, bid.address, BidState.REJECTED, 0)(scope); // REJECT
          }
        }).then(function() { // all done
          return scope;
        });
      })
      .then(handleEvent(buyer, name, ProjectEvent.ACCEPT));
  }
}

function setBidState(buyer, bidAddress, state, valueEther) {
  const contractName = 'Bid' ; // FIXME: move to bid.js
  return function(scope) {
    rest.verbose('setBidState', {buyer, bidAddress, state, valueEther});
    // function setBidState(address bidAddress, BidState state) returns (ErrorCodes) {
    const method = 'setBidState';
    const args = {
      newState: state,
    };
    return rest.setScope(scope)
      // function callMethodAddress(userName, contractName, contractAddress, methodName, args, value, node) {
      .then(rest.callMethodAddress(buyer, contractName, bidAddress, method, args, valueEther))
      .then(function(scope) {
        // returns (ErrorCodes)
        const errorCode = scope.contracts[contractName].calls[method];
        if (errorCode != ErrorCodes.SUCCESS) {
          throw new Error(errorCode);
        }
        return scope;
      });
  }
}

function settleProject(buyer, projectName, supplierAddress, bidAddress) {
  return function(scope) {
    rest.verbose('settleProject', {projectName, supplierAddress, bidAddress});
    // function settleProject(string name, address supplierAddress, address bidAddress) returns (ErrorCodes) {
    const method = 'settleProject';
    const args = {
      name: projectName,
      supplierAddress: supplierAddress,
      bidAddress: bidAddress,
    };

    return rest.setScope(scope)
      .then(rest.callMethod(buyer, contractName, method, args))
      .then(function(scope) {
        // returns (ErrorCodes)
        const errorCode = scope.contracts[contractName].calls[method];
        if (errorCode != ErrorCodes.SUCCESS) {
          throw new Error(errorCode);
        }
        return scope;
      });
  }
}

function getBid(bidId) {
  return function(scope) {
    rest.verbose('getBid', bidId);
    return rest.query(`Bid?id=eq.${bidId}`)(scope)
      .then(function(scope) {
        scope.result = scope.query.slice(-1)[0][0];
        return scope;
      });
  }
}

function getBidsByName(name) {
  return function(scope) {
    rest.verbose('getBidsByName', name);
    return rest.query(`Bid?name=eq.${name}`)(scope)
    .then(function(scope) {
      scope.result = scope.query.slice(-1)[0];
      return scope;
    });
  }
}

function getBidsBySupplier(supplier) {
  return function(scope) {
    rest.verbose('getBidsByName', supplier);
    return rest.query(`Bid?supplier=eq.${supplier}`)(scope)
    .then(function(scope) {
      scope.result = scope.query.slice(-1)[0];
      return scope;
    });
  }
}

function* exists(buyer, contract, name) {
  rest.verbose('exists', name);
  // function exists(string name) returns (bool) {
  const method = 'exists';
  const args = {
    name: name,
  };
  const result = yield rest.callMethod(buyer, contract, method, args);
  const exists = (result[0] === true);
  return exists;
}

function* getProject(buyer, contract, name) {
  rest.verbose('getProject', name);
  // function getProject(string name) returns (address) {
  const method = 'getProject';
  const args = {
    name: name,
  };

  // returns address
  const address = (yield rest.callMethod(buyer, contract, method, args))[0];
  // if not found - throw
  if (address == 0) {
    throw new Error(ErrorCodes.NOT_FOUND);
  }
  // found - query for the full record
  const trimmed = util.trimLeadingZeros(address); // FIXME leading zeros bug
  const project = (yield rest.waitQuery(`${projectContractName}?address=eq.${trimmed}`, 1))[0];
  return project;
}

function* getProjects(contract) {
  rest.verbose('getProjects', contract);
  const state = yield getState(contract);
  const projects = state.projects.slice(1); // remove the first '0000' project
  const trimmed = util.trimLeadingZeros(projects); // FIXME leading zeros bug
  const csv = util.toCsv(trimmed); // generate csv string
  const results = yield rest.query(`${projectContractName}?address=in.${csv}`);
  return results;
}

function getProjectsByBuyer(buyer) {
  return function(scope) {
    rest.verbose('getProjectsByBuyer', buyer);
    return rest.setScope(scope)
      .then(getProjects())
      .then(function(scope) {
        const projects = scope.result;
        const filtered = projects.filter(function(project) {
          return project.buyer === buyer;
        });
        scope.result = filtered;
        return scope;
      });
    }
}

function getProjectsByState(state) {
  return function(scope) {
    rest.verbose('getProjectsByState', state);
    return rest.setScope(scope)
      .then(getProjects())
      .then(function(scope) {
        const projects = scope.result;
        const filtered = projects.filter(function(project) {
          return parseInt(project.state) == state;
        });
        scope.result = filtered;
        return scope;
      });
    }
}

function getProjectsBySupplier(supplier, state) {
  return function(scope) {
    rest.verbose('getProjectsBySupplier', supplier, state);
    return rest.setScope(scope)
      .then(getBidsBySupplier(supplier))
      .then(function(scope) {
        const bids = scope.result;
        const names = bids.map(function(bid) {
          return bid.name;
        });
        scope.result = names;
        return getProjectsByName(names)(scope);
      });
    }
}

function getProjectsByName(names) {
  return function(scope) {
    rest.verbose('getProjectsByName', names);
    const csv = util.toCsv(names); // generate csv string
    return rest.query(`${projectContractName}?name=in.${csv}`)(scope)
      .then(function (scope) {
        scope.result = scope.query.slice(-1)[0];
        return scope;
      });
  }
}

function handleEvent(buyer, name, projectEvent) {
  return function(scope) {
    rest.verbose('handleEvent', {buyer, name, projectEvent});

    const method = 'handleEvent';

    return rest.setScope(scope)
      .then( getProject(buyer, name) )
      .then(function (scope) {
        // function handleEvent(address projectAddress, ProjectEvent projectEvent) returns (ErrorCodes, ProjectState) {
        const projectAddress = scope.result.address;
        const args = {
          projectAddress: projectAddress,
          projectEvent: projectEvent,
        };
        return rest.callMethod(buyer, contractName, method, args)(scope);
      })
      .then(function(scope) {
        // returns (ErrorCodes, ProjectState)
        const result = scope.contracts[contractName].calls[method];
        const errorCode = parseInt(result[0]);
        if (errorCode != ErrorCodes.SUCCESS) {
          throw new Error(errorCode);
        }
        scope.result = {errorCode: parseInt(result[0]), state: parseInt(result[1])};
        return scope;
      });
  }
}

module.exports = {
  compileSearch: compileSearch,
  getState: getState,
  uploadContract: uploadContract,

  createProject: createProject,
  createBid: createBid,
  acceptBid: acceptBid,
  exists: exists,
  getBid: getBid,
  getBidsByName: getBidsByName,
  getBidsBySupplier: getBidsBySupplier,
  getProject: getProject,
  getProjects: getProjects,
  getProjectsByBuyer: getProjectsByBuyer,
  getProjectsByState: getProjectsByState,
  getProjectsBySupplier: getProjectsBySupplier,
  handleEvent: handleEvent,
  settleProject: settleProject,
};
