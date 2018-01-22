const ba = require('blockapps-rest');
const rest = ba.rest;
const util = ba.common.util;
const config = ba.common.config;
const Promise = ba.common.Promise;

const userManagerJs = require(process.cwd() + '/' + config.libPath + '/user/userManager');
const projectManagerJs = require(process.cwd() + '/' + config.libPath + '/project/projectManager');

const ProjectEvent = ba.rest.getEnums(`${config.libPath}/project/contracts/ProjectEvent.sol`).ProjectEvent;
const ErrorCodes = ba.rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;

const contractName = 'AdminInterface';
const contractFilename = '/admin/AdminInterface.sol';
const subContractsNames = ['userManager', 'projectManager'];

function* uploadContract(admin, libPath) {
  const contract = yield rest.uploadContract(admin, contractName, libPath + contractFilename);
  contract.src = 'removed';
  yield compileSearch();
  return yield setContract(admin, contract);
}

function* compileSearch() {
  const libPath = process.cwd() + '/' + config.libPath;
  // compile dependencies
  const bidJs = require(`${libPath}/bid/bid`);
  const userJs = require(`${libPath}/user/user`);
  const projectJs = require(`${libPath}/project/project`);
  // compile
  const searchable = [
    bidJs.contractName,
    projectJs.contractName,
    userJs.contractName,
    userManagerJs.contractName,
    projectManagerJs.contractName,
    contractName
  ];
  yield rest.compileSearch(searchable, contractName, config.libPath + contractFilename)
}

function* getSubContracts(contract) {
  rest.verbose('getSubContracts', {contract, subContractsNames});
  const state = yield rest.getState(contract);
  const subContracts = {}
  subContractsNames.map(name => {
    const address = state[name];
    if (address === undefined || address == 0) throw new Error('Sub contract address not found ' + name);
    subContracts[name] = {
      name: name[0].toUpperCase() + name.substring(1),
      address: address,
    }
  });
  return subContracts;
}

function* setContract(admin, contract) {
  rest.verbose('setContract', {admin, contract});
  // set the managers
  const subContarcts = yield getSubContracts(contract);
  const userManager = userManagerJs.setContract(admin, subContarcts['userManager']);
  const projectManager = projectManagerJs.setContract(admin, subContarcts['projectManager']);

  contract.getBalance = function* (username) {
    rest.verbose('dapp: getBalance', username);
    return yield userManager.getBalance(username);
  }
  // project - create
  contract.createProject = function* (args) {
    return yield createProject(projectManager, args);
  }
  // project - by name
  contract.getProject = function* (name) {
    rest.verbose('dapp: getProject', name);
    return yield projectManager.getProject(name);
  }
  // projects - by buyer
  contract.getProjectsByBuyer = function* (buyer) {
    rest.verbose('dapp: getProjectsByBuyer', buyer);
    return yield projectManager.getProjectsByBuyer(buyer);
  }
  // projects - by state
  contract.getProjectsByState = function* (state) {
    rest.verbose('dapp: getProjectsByState', state);
    return yield projectManager.getProjectsByState(state);
  }
  // projects - by supplier
  contract.getProjectsBySupplier = function* (supplier) {
    rest.verbose('dapp: getProjectsBySupplier', supplier);
    return yield projectManager.getProjectsBySupplier(supplier);
  }
  // create bid
  contract.createBid = function* (name, supplier, amount) {
    rest.verbose('dapp: createBid', {name, supplier, amount});
    return yield projectManager.createBid(name, supplier, amount);
  }
  // bids by name
  contract.getBids = function* (name) {
    rest.verbose('dapp: getBids', name);
    return yield projectManagerJs.getBidsByName(name);
  }
  // handle event
  contract.handleEvent = function* (args) {
    return yield handleEvent(userManager, projectManager, args);
  }
  // login
  contract.login = function* (username, password) {
    return yield login(userManager, username, password);
  }
  // deploy
  contract.deploy = function* (dataFilename, deployFilename) {
    return yield deploy(admin, contract, userManager, dataFilename, deployFilename);
  }

  return contract;
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
  const users = [];
  for (let presetUser of presetUsers) {
    const args = {
      username: presetUser.username,
      password: presetUser.password,
      role: UserRole[presetUser.role],
    }
    const user = yield userManager.createUser(args);
    users.push(user);
  }
  return users;
}

function* deploy(admin, contract, userManager, presetDataFilename, deployFilename) {
  rest.verbose('dapp: deploy', {presetDataFilename, deployFilename});
  const fsutil = ba.common.fsutil;

  const presetData = fsutil.yamlSafeLoadSync(presetDataFilename);
  if (presetData === undefined) throw new Error('Preset data read failed ' + presetDataFilename);
  console.log('Preset data', JSON.stringify(presetData, null, 2));

  // create preset users
  const users = yield createPresetUsers(userManager, presetData.users);   // TODO test the users are all in

  const deployment = {
    url: config.getBlocUrl(),
    admin: admin,
    contract: {
      name: contract.name,
      address: contract.address,
    },
    users: presetData.users,
  };
  // write
  console.log('deploy filename:', deployFilename);
  console.log(fsutil.yamlSafeDumpSync(deployment));

  fsutil.yamlWrite(deployment, deployFilename);
  return deployment;
}

module.exports = {
  setContract: setContract,
  compileSearch: compileSearch,
  uploadContract: uploadContract,
};
