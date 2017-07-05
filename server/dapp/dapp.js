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
//  projectManager.compileSearch();   911
  yield userManager.compileSearch();
}

// =========================== business functions ========================

function* login(admin, username, password) {
  rest.verbose('dapp: login', {admin, username, password});
  const contract = AI.subContracts['UserManager'];
  console.log(contract);
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

function createProject(adminName, args) {
  return function(scope) {
    rest.verbose('dapp: createProject', {adminName, args});
    args.created = +new Date();
    return setScope(scope)
      .then(projectManager.createProject(adminName, args));
  }
}

// all projects - unfiltered
function getProjects() {
  return function(scope) {
    rest.verbose('dapp: getProjects');
    return setScope(scope)
      .then(projectManager.getProjects());
  }
}

// projects - by buyer
function getProjectsByBuyer(buyer) {
  return function(scope) {
    rest.verbose('dapp: getProjectsByBuyer', buyer);
    return setScope(scope)
      .then(projectManager.getProjectsByBuyer(buyer));
  }
}

// projects - by state
function getProjectsByState(state) {
  return function(scope) {
    rest.verbose('dapp: getProjectsByState', state);
    return setScope(scope)
      .then(projectManager.getProjectsByState(state));
  }
}

// create bid
function createBid(adminName, name, supplier, amount) {
  return function(scope) {
    rest.verbose('dapp: createBid', adminName, name, supplier, amount);
    return setScope(scope)
      .then(projectManager.createBid(adminName, name, supplier, amount));
  }
}

// accept bid
function acceptBid(adminName, buyer, bidId, name) {
  return function(scope) {
    rest.verbose('dapp: acceptBid', {adminName, buyer, bidId, name});
    return setScope(scope)
      .then(userManager.getUser(adminName, buyer))
      .then(function(scope){
        const user = scope.result;
        scope.users[buyer].address = user.account;
        return scope;
      })
      .then(projectManager.acceptBid(buyer, bidId, name));
  }
}

// projects by supplier (State optional)
function getProjectsBySupplier(supplier, state) {
  return function(scope) {
    rest.verbose('dapp: getProjectsBySupplier', {supplier, state});
    return setScope(scope)
      .then(projectManager.getProjectsBySupplier(supplier, state));
  }
}

// project by name
function getProject(adminName, name) {
  return function(scope) {
    rest.verbose('dapp: getProject', name);
    return setScope(scope)
      .then(projectManager.getProject(adminName, name));
  }
}

// bids by name
function getBids(adminName, name) {
  return function(scope) {
    rest.verbose('dapp: getBids', name);
    return setScope(scope)
      .then(projectManager.getBidsByName(name));
  }
}

// handle project event
function handleEvent(adminName,/*, name, projectEvent, username, password*/ args) {
  const name = args.name;

  return function(scope) {
    rest.verbose('dapp: project handleEvent', { args });


    switch(args.projectEvent) {
      case ProjectEvent.RECEIVE:
        return setScope(scope)
          .then(projectManager.getBidsByName(name))
          .then(function(scope){
            const bids = scope.result;
            // find the accepted bid
            const accepted = bids.filter(function(bid) {
              return parseInt(bid.state) == BidState.ACCEPTED;
            });
            if (accepted.length != 1) {
              throw(new Error(ErrorCodes.NOT_FOUND));
            }
            // supplier NAME
            scope.supplierName = accepted[0].supplier;
            scope.valueEther = accepted[0].amount;
            scope.bidAddress = accepted[0].address;
            return scope;
          })
          .then(function(scope) {
            return userManager.getUser(adminName, scope.supplierName)(scope);
          })
          .then(function(scope) {
            const supplier = scope.result;
            return projectManager.settleProject(adminName, name, supplier.account, scope.bidAddress)(scope);
          });

      case ProjectEvent.ACCEPT:
        return acceptBid(adminName, args.username, args.bidId, name)(scope);

      default:
        return projectManager.handleEvent(adminName, name, args.projectEvent)(scope);
    }
  }
}

// getBalance
function* getBalance(admin, contract, username) {
  rest.verbose('dapp: getBalance', username);
  return yield userManager.getBalance(admin, contract, username);
}

// throws: ErrorCodes
function receiveProject(adminName, name, password) {
  return function(scope) {
    rest.verbose('receiveProject', name);
    return rest.setScope(scope)
      // get project
      .then(getProject(adminName, name))
      // extract the buyer
      .then(function(scope) {
        const project = scope.result;
        scope.buyerName = project.buyer;
        return scope;
      })
      // get the buyer info
      .then(function(scope) {
        return userManager.getUser(adminName, scope.buyerName)(scope);
      })
      .then(function(scope) {
        scope.buyer = scope.result;
        return scope;
      })
      // get project bids
      .then(projectManager.getBidsByName(name))
      // extract the supplier out of the accepted bid
      .then(function(scope) {
        const bids = scope.result;
        // find the accepted bid
        const accepted = bids.filter(function(bid) {
          return bid.state == BidState[BidState.ACCEPTED];
        });
        if (accepted.length != 1) {
          throw(new Error(ErrorCodes.NOT_FOUND));
        }
        // supplier NAME
        scope.supplierName = accepted[0].supplier;
        scope.valueEther = accepted[0].amount;
        scope.bidAddress = accepted[0].address;
        return scope;
      })
      // get the supplier info
      .then(function(scope) {
        return userManager.getUser(adminName, scope.supplierName)(scope)
      })
      .then(function(scope) {
        scope.supplier = scope.result;
        return scope;
      })
      // Settle the project:  change state to RECEIVED and tell the bid to send the funds to the supplier
      .then(function(scope) {
        return projectManager.settleProject(adminName, name, scope.supplier.account, scope.bidAddress)(scope);
      });
  }
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
    getProjects: getProjects,
    getProjectsByBuyer: getProjectsByBuyer,
    getProjectsByState: getProjectsByState,
    getProjectsBySupplier: getProjectsBySupplier,
    createBid: createBid,
    getBids: getBids,
    acceptBid: acceptBid,
    getProject: getProject,
    handleEvent: handleEvent,
  };
};
