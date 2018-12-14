const ba = require('blockapps-rest');
const rest = ba.rest6;
const util = ba.common.util;
const config = ba.common.config;
const Promise = ba.common.Promise;
const BigNumber = ba.common.BigNumber;
const constants = ba.common.constants;

const contractName = 'ProjectManager';
const contractFilename = `${config.libPath}/project/contracts/ProjectManager.sol`;

const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;
const ProjectState = ba.rest.getEnums(`${config.libPath}/project/contracts/ProjectState.sol`).ProjectState;
const ProjectEvent = ba.rest.getEnums(`${config.libPath}/project/contracts/ProjectEvent.sol`).ProjectEvent;
const BidState = ba.rest.getEnums(`${config.libPath}/bid/contracts/BidState.sol`).BidState;
const projectContractName = require('./project').contractName;

function* uploadContract(admin, args, chainId) {
  const contract = yield rest.uploadContract(admin, contractName, contractFilename, args, chainId);
  yield compileSearch(contract);
  contract.src = 'removed';
  return setContract(admin, contract, chainId);
}

function setContract(admin, contract, chainId) {
  contract.getState = function* (chainId) {
    return yield rest.getState(contract, chainId);
  }
  contract.createProject = function* (args, chainId) {
    return yield createProject(admin, contract, args, chainId);
  }
  contract.getProject = function* (name, chainId) {
    return yield getProject(admin, contract, name, chainId);
  }
  contract.getProjects = function* (chainId, name) {
    return yield getProjects(contract, chainId);
  }
  contract.exists = function* (name, chainId) {
    return yield exists(admin, contract, name, chainId);
  }
  contract.getProjectsByBuyer = function* (buyer, chainId) {
    return yield getProjectsByBuyer(contract, buyer, chainId);
  }
  contract.getProjectsBySupplier = function* (supplier, chainId) {
    return yield getProjectsBySupplier(contract, supplier, chainId);
  }
  contract.getProjectsByName = function* (name, chainId) {
    return yield getProjectsByName(contract, name, chainId);
  }
  contract.getProjectsByState = function* (state, chainId) {
    return yield getProjectsByState(contract, state, chainId);
  }
  contract.handleEvent = function* (name, projectEvent, chainId) {
    return yield handleEvent(admin, contract, name, projectEvent, chainId);
  }
  contract.createBid = function* (name, supplier, amount, chainId) {
    return yield createBid(admin, contract, name, supplier, amount, chainId);
  }
  contract.acceptBid = function* (buyer, bidId, name, chainId) {
    return yield acceptBid(admin, contract, buyer, bidId, name, chainId);
  }
  contract.settleProject = function* (projectName, supplierAddress, bidAddress, chainId) {
    return yield settleProject(admin, contract, projectName, supplierAddress, bidAddress, chainId);
  }
  contract.getAcceptedBid = getAcceptedBid;

  return contract;
}

function* compileSearch(contract) {
  rest.verbose('compileSearch', contract.codeHash);
  if (yield rest.isSearchable(contract.codeHash)) {
    return;
  }
  // compile dependencies
  const bidJs = require('../bid/bid');
  const userJs = require('../user/user');
  const projectJs = require('./project');
  // compile
  const searchable = [bidJs.contractName, projectJs.contractName, contractName];
  return yield rest.compileSearch(searchable, contractName, contractFilename);
}

// throws: ErrorCodes
// returns: record from search
function* createProject(admin, contract, args, chainId) {
  rest.verbose('createProject', { admin, args, chainId });
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

  const result = yield rest.callMethod(admin, contract, method, args, { chainId });
  const errorCode = parseInt(result[0]);
  if (errorCode != ErrorCodes.SUCCESS) {
    throw new Error(errorCode);
  }
  // get the contract data from search
  const project = yield getProject(admin, contract, args.name, chainId);
  return project;
}

// throws: ErrorCodes
// returns: record from search
function* createBid(admin, contract, name, supplier, amount, chainId) {
  rest.verbose('createBid', { name, supplier, amount, chainId });
  // function createBid(string name, string supplier, uint amount) returns (ErrorCodes, uint) {
  const method = 'createBid';
  const args = {
    name: name,
    supplier: supplier,
    amount: amount,
  };

  const result = yield rest.callMethod(admin, contract, method, args, { chainId } );
  const errorCode = parseInt(result[0]);
  if (errorCode != ErrorCodes.SUCCESS) {
    throw new Error(errorCode);
  }
  const bidId = result[1];
  // block until the contract shows up in search
  const bid = (yield rest.waitQuery(`Bid?id=eq.${bidId}&chainId=eq.${chainId}`, 1))[0];
  return bid;
}

// throws: ErrorCodes
function* acceptBid(admin, contract, buyer, bidId, name, chainId) {   // FIXME should go into the contract
  rest.verbose('acceptBid', { admin, buyer, bidId, name, chainId });
  const bids = yield getBidsByName(name, chainId);
  if (bids.length < 1) {
    throw new Error(ErrorCodes.NOT_FOUND);
  }
  // find the winning bid
  const winningBid = bids.filter(bid => {
    return bid.id == bidId;
  })[0];
  // accept the bid (will transfer funds from buyer to bid contract)
  try {
    const temp = yield setBidState(admin, buyer, winningBid.address, BidState.ACCEPTED, winningBid.amount, chainId);
  } catch (error) {
    // check insufficient balance
    if (error.status == 400) {
      throw new Error(ErrorCodes.INSUFFICIENT_BALANCE);
    }
    throw error;
  }
  // reject all other bids
  for (let bid of bids) {
    if (bid.id != bidId) {
      yield setBidState(admin, buyer, bid.address, BidState.REJECTED, 0, chainId); // REJECT
    }
  }
  const result = yield handleEvent(admin, contract, name, ProjectEvent.ACCEPT, chainId);
  return result;
}

function* setBidState(admin, buyer, bidAddress, state, valueEther, chainId) {
  rest.verbose('setBidState', { admin, buyer, bidAddress, state, valueEther, chainId });
  const contract = {
    name: 'Bid',
    address: bidAddress,
  }

  // function setBidState(address bidAddress, BidState state) returns (ErrorCodes) {
  const method = 'setBidState';
  const args = {
    newState: state,
    address: buyer.account
  };

  const value = new BigNumber(valueEther).mul(constants.ETHER);
  const result = yield rest.callMethod(admin, contract, method, args, { chainId, value });
  const errorCode = parseInt(result[0]);
  if (errorCode != ErrorCodes.SUCCESS) {
    throw new Error(errorCode);
  }
}

function* settleProject(admin, contract, projectName, supplierAddress, bidAddress, chainId) {
  rest.verbose('settleProject', { projectName, supplierAddress, bidAddress, chainId });
  // function settleProject(string name, address supplierAddress, address bidAddress) returns (ErrorCodes) {
  const method = 'settleProject';
  const args = {
    name: projectName,
    supplierAddress: supplierAddress,
    bidAddress: bidAddress,
  };

  const result = yield rest.callMethod(admin, contract, method, args, { chainId });
  const errorCode = parseInt(result[0]);
  if (errorCode != ErrorCodes.SUCCESS) {
    throw new Error(errorCode);
  }
}

function* getBid(bidId) {
  rest.verbose('getBid', bidId);
  return (yield rest.waitQuery(`Bid?id=eq.${bidId}`, 1))[0];
}

function* getBidsByName(name, chainId) {
  rest.verbose('getBidsByName', name);
  return yield rest.query(`Bid?name=eq.${encodeURIComponent(name)}&chainId=eq.${chainId}`);
}

function* getBidsBySupplier(supplier, chainId) {
  rest.verbose('getBidsBySupplier', supplier);
  return yield rest.query(`Bid?supplier=eq.${supplier}&chainId=eq.${chainId}`);
}

// throws: ErrorCodes
function* getAcceptedBid(projectName, chainId) {
  rest.verbose('getAcceptedBid', projectName, chainId);
  // get project bids
  const bids = yield getBidsByName(projectName, chainId);
  // extract the supplier out of the accepted bid
  const accepted = bids.filter(bid => {
    return parseInt(bid.state) === BidState.ACCEPTED;
  });
  // not found
  if (accepted.length == 0) {
    throw new Error(ErrorCodes.NOT_FOUND);
  }
  // more then one
  if (accepted.length > 1) {
    throw new Error(ErrorCodes.ERROR);
  }
  return accepted[0];
}

function* exists(admin, contract, name, chainId) {
  rest.verbose('exists', name);
  // function exists(string name) returns (bool) {
  const method = 'exists';
  const args = {
    name: name,
  };
  const result = yield rest.callMethod(admin, contract, method, args, undefined, chainId);
  const exists = (result[0] === true);
  return exists;
}

function* getProject(admin, contract, name, chainId) {
  rest.verbose('getProject', name);
  // function getProject(string name) returns (address) {
  const method = 'getProject';
  const args = {
    name: name,
  };

  // returns address
  const address = (yield rest.callMethod(admin, contract, method, args, { chainId }))[0];
  // if not found - throw
  if (address == 0) {
    throw new Error(ErrorCodes.NOT_FOUND);
  }
  // found - query for the full record
  const project = (yield rest.waitQuery(`${projectContractName}?address=eq.${address}&chainId=eq.${chainId}`, 1))[0];
  return project;
}

function* getProjects(contract, chainId) {
  rest.verbose('getProjects', chainId);
  const state = yield rest.getState(contract, { chainId });
  const projects = state.projects.slice(1); // remove the first '0000' project
  const csv = util.toCsv(projects); // generate csv string
  const results = yield rest.query(`${projectContractName}?address=in.${csv}&chainId=eq.${chainId}`);
  return results;
}

function* getProjectsByBuyer(contract, buyer, chainId) {
  rest.verbose('getProjectsByBuyer', buyer);
  const projects = yield getProjects(contract, chainId);
  const filtered = projects.filter(function (project) {
    return project.buyer === buyer;
  });
  return filtered;
}

function* getProjectsByState(contract, state, chainId) {
  rest.verbose('getProjectsByState', state);
  const projects = yield getProjects(contract, chainId);
  const filtered = projects.filter(function (project) {
    return parseInt(project.state) == state;
  });
  return filtered;
}

function* getProjectsBySupplier(contract, supplier, chainId) {
  rest.verbose('getProjectsBySupplier', supplier, chainId);
  const bids = yield getBidsBySupplier(supplier, chainId);
  const names = bids.map(function (bid) {
    return bid.name;
  });
  const projects = yield getProjectsByName(contract, names, chainId);
  return projects;
}

function* getProjectsByName(contract, names, chainId) {
  rest.verbose('getProjectsByName', names);
  if (names.length == 0) {
    return [];
  }
  // the url might get too long, so the query is broken to multipart
  const MAX = 50; // max names to list in one REST call
  const parts = Math.ceil(names.length / MAX);
  let results = [];
  for (let i = 0; i < parts; i++) {
    const start = i * MAX;
    const end = (i < parts - 1) ? (i + 1) * MAX : names.length;
    const csv = util.toCsv(names.slice(start, end)); // generate csv string
    const partialResults = yield rest.query(`${projectContractName}?chainId=eq.${chainId}&name=in.${encodeURIComponent(csv)}`); // get a part
    results = results.concat(partialResults); // add to the results
  }
  return results;
}

function* handleEvent(admin, contract, name, projectEvent, chainId) {
  rest.verbose('handleEvent', { admin, name, projectEvent, chainId });

  const project = yield getProject(admin, contract, name, chainId);
  // function handleEvent(address projectAddress, ProjectEvent projectEvent) returns (ErrorCodes, ProjectState) {
  const method = 'handleEvent';
  const args = {
    projectAddress: project.address,
    projectEvent: projectEvent
  };

  const result = yield rest.callMethod(admin, contract, method, args, { chainId });
  const errorCode = parseInt(result[0]);
  if (errorCode != ErrorCodes.SUCCESS) {
    throw new Error(errorCode);
  }
  const newState = parseInt(result[1]);
  return newState;
}

module.exports = {
  contractName: contractName,
  compileSearch: compileSearch,
  uploadContract: uploadContract,
  setContract: setContract,

  getAcceptedBid: getAcceptedBid,
  getBid: getBid,
  getBidsByName: getBidsByName,
  getBidsBySupplier: getBidsBySupplier,
  getProjectsByState: getProjectsByState,
};
