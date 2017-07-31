const ba = require('blockapps-rest');
const rest = ba.rest;
const util = ba.common.util;
const config = ba.common.config;
const Promise = ba.common.Promise;

const userManager = require(process.cwd() + '/' + config.libPath + '/user/userManager');
const projectManager = require(process.cwd() + '/' + config.libPath + '/project/projectManager');
const bid = require(process.cwd() + '/' + config.libPath + '/bid/bid');
const ProjectEvent = ba.rest.getEnums(`${config.libPath}/project/contracts/ProjectEvent.sol`).ProjectEvent;
const ErrorCodes = ba.rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;
const BidState = ba.rest.getEnums(`${config.libPath}/bid/contracts/BidState.sol`).BidState;


// ========== Admin (super user) ==========

// ========== Admin Interface ==========
const AI = {
  contract: {
    name: 'AdminInterface',
    filename: '/admin/AdminInterface.sol',
    libPath: undefined,
  },
  subContracts: {
    UserManager: {name: 'UserManager', address: undefined},
    ProjectManager: {name: 'ProjectManager', address: undefined},
  },
};

function* setAdminInterface(admin) {
  rest.verbose('setAdminInterface', arguments);
  const contractName = AI.contract.name;
  const contractFilename = AI.contract.libPath + AI.contract.filename;
  contract = yield rest.uploadContract(admin, contractName, contractFilename);
  AI.contract.address = contract.address;
  return AI;
}

function* getAdminInterface(aiAddress) {
  rest.verbose('getAdminInterface', {aiAddress, AI});
  AI.contract.address = aiAddress;

  const state = yield rest.getState(AI.contract);
  for (var name in state) {
    var address = state[name];
    if (address == 0) throw new Error(`getAdminInterface: interface not set: ${name}`);
    // capitalize first letter to match the contract name on the chain
    var capName = name[0].toUpperCase() + name.substring(1);
    AI.subContracts[capName].address = address;
  }
  return AI;
}

function* compileSearch() {
  yield projectManager.compileSearch();
  yield userManager.compileSearch();
}

// =========================== business functions ========================

function* login(admin, username, password) {
  rest.verbose('dapp: login', {admin, username, password});
  const contract = AI.subContracts['UserManager'];
  const args = {username:username, password:password};
  const result = yield userManager.login(admin, contract, args);
  // auth failed
  if (!result) {
    return {authenticate: false};
  }
  // auth OK
  const baUser = yield userManager.getUser(admin, contract, username);
  return {authenticate: true, user: baUser};
}

function* createProject(admin, contract, args) {
  rest.verbose('dapp: createProject', {admin, args});
  args.created = +new Date();
  const project = yield projectManager.createProject(admin, contract, args);
  return project;
}

// projects - by buyer
function* getProjectsByBuyer(admin, contract, buyer) {
  rest.verbose('dapp: getProjectsByBuyer', buyer);
  return yield projectManager.getProjectsByBuyer(contract, buyer);
}

// projects - by state
function* getProjectsByState(admin, contract, state) {
  rest.verbose('dapp: getProjectsByState', state);
  return yield projectManager.getProjectsByState(contract, state);
}

// projects - by supplier (State optional)
function* getProjectsBySupplier(admin, contract, supplier, state) {
  rest.verbose('dapp: getProjectsBySupplier', {supplier, state});
  return yield projectManager.getProjectsBySupplier(contract, supplier, state);
}

// create bid
function* createBid(admin, contract, name, supplier, amount) {
  rest.verbose('dapp: createBid', {name, supplier, amount});
  return yield projectManager.createBid(admin, contract, name, supplier, amount);
}

// accept bid
function* acceptBid(admin, AI, buyerName, buyerPassword, bidId, projectName) {
  rest.verbose('dapp: acceptBid', {buyerName, buyerPassword, bidId, projectName});
  const buyer = yield userManager.getUser(admin, AI.subContracts['UserManager'], buyerName);
  buyer.password = buyerPassword;
  const result = yield projectManager.acceptBid(admin, AI.subContracts['ProjectManager'], buyer, bidId, projectName);
  return result;
}

// receive project
function* receiveProject(admin, AI, projectName) {
  rest.verbose('dapp: receiveProject', projectName);
  // get the accepted bid
  const bid = yield projectManager.getAcceptedBid(projectName);
  // get the supplier for the accepted bid
  const supplier = yield userManager.getUser(admin, AI.subContracts['UserManager'], bid.supplier);
  // Settle the project:  change state to RECEIVED and tell the bid to send the funds to the supplier
  const result = yield projectManager.settleProject(admin, AI.subContracts['ProjectManager'], projectName, supplier.account, bid.address);
  return result;
}

// project by name
function* getProject(admin, contract, name) {
  rest.verbose('dapp: getProject', name);
  return yield projectManager.getProject(admin, contract, name);
}

// bids by name
function* getBids(admin, contract, name) {
  rest.verbose('dapp: getBids', name);
  return yield projectManager.getBidsByName(name);
}

// handle project event
function* handleEvent(admin, AI, args) {
  const name = args.name;
  rest.verbose('dapp: project handleEvent', args);

    switch(args.projectEvent) {
      case ProjectEvent.RECEIVE:
        return yield receiveProject(admin, AI, args.projectName);

      case ProjectEvent.ACCEPT:
        return yield acceptBid(admin, AI, args.username, args.password, args.bidId, args.projectName);

      default:
        return yield projectManager.handleEvent(admin, AI.subContracts['ProjectManager'], args.projectName, args.projectEvent);
    }
}

// getBalance
function* getBalance(admin, contract, username) {
  rest.verbose('dapp: getBalance', username);
  return yield userManager.getBalance(admin, contract, username);
}

module.exports = function (libPath) {
  rest.verbose('construct', {libPath});
  AI.contract.libPath = libPath;

  return {
    AI: AI,
    compileSearch: compileSearch,
    getAdminInterface: getAdminInterface,
    setAdminInterface: setAdminInterface,
    // business functions
    login: login,
    createProject: createProject,
    getBalance: getBalance,
    getProjectsByBuyer: getProjectsByBuyer,
    getProjectsByState: getProjectsByState,
    getProjectsBySupplier: getProjectsBySupplier,
    createBid: createBid,
    getBids: getBids,
    getProject: getProject,
    handleEvent: handleEvent,
  };
};
