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
function* createBid(buyer, contract, name, supplier, amount) {
  rest.verbose('createBid', {name, supplier, amount});
  // function createBid(string name, string supplier, uint amount) returns (ErrorCodes, uint) {
  const method = 'createBid';
  const args = {
    name: name,
    supplier: supplier,
    amount: amount,
  };

  const result = yield rest.callMethod(buyer, contract, method, args);
  const errorCode = parseInt(result[0]);
  if (errorCode != ErrorCodes.SUCCESS) {
    throw new Error(errorCode);
  }
  const bidId = result[1];
  // block until the contract shows up in search
  const bid = (yield rest.waitQuery(`Bid?id=eq.${bidId}`, 1))[0];
  return bid;
}

// throws: ErrorCodes
function* acceptBid(buyer, contract, bidId, name) {   // FIXME should go into the contract
  rest.verbose('acceptBid', {buyer, bidId, name});
  const bids = yield getBidsByName(name);
  for (let bid of bids) {
    // accept the selected bid - reject the others
    if (bid.id == bidId) {
      yield setBidState(buyer, bid.address, BidState.ACCEPTED, bid.amount); // ACCEPT
    } else {
      yield setBidState(buyer, bid.address, BidState.REJECTED, 0); // REJECT
    }
  }
  const result = yield handleEvent(buyer, contract, name, ProjectEvent.ACCEPT);
  return result;
}

function* setBidState(buyer, bidAddress, state, valueEther) {
  rest.verbose('setBidState', {buyer, bidAddress, state, valueEther});
  const contract = {
    name: 'Bid',
    address: bidAddress,
  }

  // function setBidState(address bidAddress, BidState state) returns (ErrorCodes) {
  const method = 'setBidState';
  const args = {
    newState: state,
  };

  const result = yield rest.callMethod(buyer, contract, method, args, valueEther);
  const errorCode = parseInt(result[0]);
  if (errorCode != ErrorCodes.SUCCESS) {
    throw new Error(errorCode);
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

function* getBid(bidId) {
  rest.verbose('getBid', bidId);
  return (yield rest.waitQuery(`Bid?id=eq.${bidId}`,1))[0];
}

function* getBidsByName(name) {
  rest.verbose('getBidsByName', name);
  return yield rest.query(`Bid?name=eq.${name}`);
}

function* getBidsBySupplier(supplier) {
  rest.verbose('getBidsBySupplier', supplier);
  return yield rest.query(`Bid?supplier=eq.${supplier}`);
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

function* getProjectsByBuyer(contract, buyer) {
  rest.verbose('getProjectsByBuyer', buyer);
  const projects = yield getProjects(contract);
  const filtered = projects.filter(function(project) {
    return project.buyer === buyer;
  });
  return filtered;
}

function* getProjectsByState(contract, state) {
  rest.verbose('getProjectsByState', state);
  const projects = yield getProjects(contract);
  const filtered = projects.filter(function(project) {
    return parseInt(project.state) == state;
  });
  return filtered;
}

function* getProjectsBySupplier(contract, supplier, state) {
  rest.verbose('getProjectsBySupplier', supplier, state);
  const bids = yield getBidsBySupplier(supplier);
  const names = bids.map(function(bid) {
    return bid.name;
  });
  const projects = yield getProjectsByName(contract, names);
  return projects;
}

function* getProjectsByName(contract, names) {
  rest.verbose('getProjectsByName', names);
  const csv = util.toCsv(names); // generate csv string
  const results = yield rest.query(`${projectContractName}?name=in.${csv}`);
  return results;
}

function* handleEvent(buyer, contract, name, projectEvent) {
  rest.verbose('handleEvent', {buyer, name, projectEvent});

  const project = yield getProject(buyer, contract, name);
  // function handleEvent(address projectAddress, ProjectEvent projectEvent) returns (ErrorCodes, ProjectState) {
  const method = 'handleEvent';
  const args = {
    projectAddress: project.address,
    projectEvent: projectEvent,
  };
  const result = yield rest.callMethod(buyer, contract, method, args);
  const errorCode = parseInt(result[0]);
  if (errorCode != ErrorCodes.SUCCESS) {
    throw new Error(errorCode);
  }
  const newState = parseInt(result[1]);
  return newState;
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
