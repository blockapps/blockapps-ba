const ba = require('blockapps-rest');
const rest = ba.rest;
const util = ba.common.util;
const config = ba.common.config;
const Promise = ba.common.Promise;

const userManagerJs = require(process.cwd() + '/' + config.libPath + '/user/userManager');
const projectManagerJs = require(process.cwd() + '/' + config.libPath + '/project/projectManager');

const bid = require(process.cwd() + '/' + config.libPath + '/bid/bid');
const ProjectEvent = ba.rest.getEnums(`${config.libPath}/project/contracts/ProjectEvent.sol`).ProjectEvent;
const ErrorCodes = ba.rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;

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

function* uploadContract(admin) {
  const contractName = AI.contract.name;
  const contractFilename = AI.contract.libPath + AI.contract.filename;
  const contract = yield rest.uploadContract(admin, contractName, contractFilename);
  yield compileSearch();
  contract.src = 'removed';
  return yield getDapp(admin, contract.address);
}

function* compileSearch() {
  yield projectManagerJs.compileSearch();
  yield userManagerJs.compileSearch();
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

function* getDapp(admin, aiAddress) {
  rest.verbose('getDapp', {admin, aiAddress});
  //AI.contract.address = aiAddress;
  const AI = yield getAdminInterface(aiAddress);

  const userManagerContract = userManagerJs.setContract(admin, AI.subContracts['UserManager']);
  const projectManagerContract = projectManagerJs.setContract(admin, AI.subContracts['ProjectManager']);

  const dapp = {}
  dapp.aiAddress = aiAddress;
  dapp.getBalance = function* (username) {
    rest.verbose('dapp: getBalance', username);
    return yield userManagerContract.getBalance(username);
  }
  // project - create
  dapp.createProject = function* (args) {
    return yield createProject(projectManagerContract, args);
  }
  // project - by name
  dapp.getProject = function* (name) {
    rest.verbose('dapp: getProject', name);
    return yield projectManagerContract.getProject(name);
  }
  // projects - by buyer
  dapp.getProjectsByBuyer = function* (buyer) {
    rest.verbose('dapp: getProjectsByBuyer', buyer);
    return yield projectManagerContract.getProjectsByBuyer(buyer);
  }
  // projects - by state
  dapp.getProjectsByState = function* (state) {
    rest.verbose('dapp: getProjectsByState', state);
    return yield projectManagerContract.getProjectsByState(state);
  }
  // projects - by supplier
  dapp.getProjectsBySupplier = function* (supplier) {
    rest.verbose('dapp: getProjectsBySupplier', supplier);
    return yield projectManagerContract.getProjectsBySupplier(supplier);
  }
  // create bid
  dapp.createBid = function* (name, supplier, amount) {
    rest.verbose('dapp: createBid', {name, supplier, amount});
    return yield projectManagerContract.createBid(name, supplier, amount);
  }
  // bids by name
  dapp.getBids = function* (name) {
    rest.verbose('dapp: getBids', name);
    return yield projectManagerJs.getBidsByName(name);
  }
  // handle event
  dapp.handleEvent = function* (args) {
    return yield handleEvent(userManagerContract, projectManagerContract, args);
  }
  // login
  dapp.login = function* (username, password) {
    return yield login(userManagerContract, username, password);
  }
  // create preset users
  dapp.createPresetUsers = function* (presetUsers) {
    return yield createPresetUsers(userManagerContract, presetUsers);
  }

  return dapp;
}

// =========================== business functions ========================

function* login(userManagerContract, username, password) {
  rest.verbose('dapp: login', {username, password});
  const args = {username:username, password:password};
  const result = yield userManagerContract.login(args);
  // auth failed
  if (!result) {
    return {authenticate: false};
  }
  // auth OK
  const baUser = yield userManagerContract.getUser(username);
  return {authenticate: true, user: baUser};
}

function* createProject(projectManagerContract, args) {
  rest.verbose('dapp: createProject', {args});
  args.created = +new Date();
  const project = yield projectManagerContract.createProject(args);
  return project;
}

// accept bid
function* acceptBid(userManagerContract, projectManagerContract, buyerName, buyerPassword, bidId, projectName) {
  rest.verbose('dapp: acceptBid', {buyerName, buyerPassword, bidId, projectName});
  const buyer = yield userManagerContract.getUser(buyerName);
  buyer.password = buyerPassword;
  const result = yield projectManagerContract.acceptBid(buyer, bidId, projectName);
  return result;
}

// receive project
function* receiveProject(userManagerContract, projectManagerContract, projectName) {
  rest.verbose('dapp: receiveProject', projectName);
  // get the accepted bid
  const bid = yield projectManagerContract.getAcceptedBid(projectName);
  // get the supplier for the accepted bid
  const supplier = yield userManagerContract.getUser(bid.supplier);
  // Settle the project:  change state to RECEIVED and tell the bid to send the funds to the supplier
  const result = yield projectManagerContract.settleProject(projectName, supplier.account, bid.address);
  return result;
}

// handle project event
function* handleEvent(userManagerContract, projectManagerContract, args) {
  const name = args.name;
  rest.verbose('dapp: project handleEvent', args);

    switch(args.projectEvent) {
      case ProjectEvent.RECEIVE:
        return yield receiveProject(userManagerContract, projectManagerContract, args.projectName);

      case ProjectEvent.ACCEPT:
        return yield acceptBid(userManagerContract, projectManagerContract, args.username, args.password, args.bidId, args.projectName);

      default:
        return yield projectManagerContract.handleEvent(args.projectName, args.projectEvent);
    }
}

function* createPresetUsers(userManagerContract, presetUsers) {
  const UserRole = rest.getEnums(`${config.libPath}/user/contracts/UserRole.sol`).UserRole;
  for (let presetUser of presetUsers) {
    const args = {
      username: presetUser.username,
      password: presetUser.password,
      role: UserRole[presetUser.role],
    }
    const user = yield userManagerContract.createUser(args);
  }
}

module.exports = function (libPath) {
  rest.verbose('construct', {libPath});
  AI.contract.libPath = libPath;

  return {
    getDapp: getDapp,
    compileSearch: compileSearch,
    uploadContract: uploadContract,
    getAdminInterface: getAdminInterface,
  };
};
