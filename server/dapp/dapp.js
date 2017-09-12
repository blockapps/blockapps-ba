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

  const userManager = userManagerJs.setContract(admin, AI.subContracts['UserManager']);
  const projectManager = projectManagerJs.setContract(admin, AI.subContracts['ProjectManager']);

  const dapp = {}
  dapp.aiAddress = aiAddress;
  dapp.getBalance = function* (username) {
    rest.verbose('dapp: getBalance', username);
    return yield userManager.getBalance(username);
  }
  // project - create
  dapp.createProject = function* (args) {
    return yield createProject(projectManager, args);
  }
  // project - by name
  dapp.getProject = function* (name) {
    rest.verbose('dapp: getProject', name);
    return yield projectManager.getProject(name);
  }
  // projects - by buyer
  dapp.getProjectsByBuyer = function* (buyer) {
    rest.verbose('dapp: getProjectsByBuyer', buyer);
    return yield projectManager.getProjectsByBuyer(buyer);
  }
  // projects - by state
  dapp.getProjectsByState = function* (state) {
    rest.verbose('dapp: getProjectsByState', state);
    return yield projectManager.getProjectsByState(state);
  }
  // projects - by supplier
  dapp.getProjectsBySupplier = function* (supplier) {
    rest.verbose('dapp: getProjectsBySupplier', supplier);
    return yield projectManager.getProjectsBySupplier(supplier);
  }
  // create bid
  dapp.createBid = function* (name, supplier, amount) {
    rest.verbose('dapp: createBid', {name, supplier, amount});
    return yield projectManager.createBid(name, supplier, amount);
  }
  // bids by name
  dapp.getBids = function* (name) {
    rest.verbose('dapp: getBids', name);
    return yield projectManagerJs.getBidsByName(name);
  }
  // handle event
  dapp.handleEvent = function* (args) {
    return yield handleEvent(userManager, projectManager, args);
  }
  // login
  dapp.login = function* (username, password) {
    return yield login(userManager, username, password);
  }
  // create preset users
  dapp.createPresetUsers = function* (presetUsers) {
    return yield createPresetUsers(userManager, presetUsers);
  }

  return dapp;
}

// =========================== business functions ========================

function* login(userManager, username, password) {
  rest.verbose('dapp: login', {username, password});
  const args = {username:username, password:password};
  const result = yield userManager.login(args);
  // auth failed
  if (!result) {
    return {authenticate: false};
  }
  // auth OK
  const baUser = yield userManager.getUser(username);
  return {authenticate: true, user: baUser};
}

function* createProject(projectManager, args) {
  rest.verbose('dapp: createProject', {args});
  args.created = +new Date();
  const project = yield projectManager.createProject(args);
  return project;
}

// accept bid
function* acceptBid(userManager, projectManager, buyerName, buyerPassword, bidId, projectName) {
  rest.verbose('dapp: acceptBid', {buyerName, buyerPassword, bidId, projectName});
  const buyer = yield userManager.getUser(buyerName);
  buyer.password = buyerPassword;
  const result = yield projectManager.acceptBid(buyer, bidId, projectName);
  return result;
}

// receive project
function* receiveProject(userManager, projectManager, projectName) {
  rest.verbose('dapp: receiveProject', projectName);
  // get the accepted bid
  const bid = yield projectManager.getAcceptedBid(projectName);
  // get the supplier for the accepted bid
  const supplier = yield userManager.getUser(bid.supplier);
  // Settle the project:  change state to RECEIVED and tell the bid to send the funds to the supplier
  const result = yield projectManager.settleProject(projectName, supplier.account, bid.address);
  return result;
}

// handle project event
function* handleEvent(userManager, projectManager, args) {
  const name = args.name;
  rest.verbose('dapp: project handleEvent', args);

    switch(args.projectEvent) {
      case ProjectEvent.RECEIVE:
        return yield receiveProject(userManager, projectManager, args.projectName);

      case ProjectEvent.ACCEPT:
        return yield acceptBid(userManager, projectManager, args.username, args.password, args.bidId, args.projectName);

      default:
        return yield projectManager.handleEvent(args.projectName, args.projectEvent);
    }
}

function* createPresetUsers(userManager, presetUsers) {
  const UserRole = rest.getEnums(`${config.libPath}/user/contracts/UserRole.sol`).UserRole;
  for (let presetUser of presetUsers) {
    const args = {
      username: presetUser.username,
      password: presetUser.password,
      role: UserRole[presetUser.role],
    }
    const user = yield userManager.createUser(args);
  }
}

module.exports = function (libPath) {
  rest.verbose('construct', {libPath});
  AI.contract.libPath = libPath;

  return {
    getDapp: getDapp,
    compileSearch: compileSearch,
    uploadContract: uploadContract,
  };
};
