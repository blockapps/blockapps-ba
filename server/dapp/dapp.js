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

function testAdminInterface(scope) {
  for (var name in AI.subContractsNames) {
    if (scope.contracts[name] === undefined) throw new Error('setAdmin: AdminInterface: undefined: ' + name);
    if (scope.contracts[name] === 0) throw new Error('setAdmin: AdminInterface: 0: ' + name);
    if (scope.contracts[name].address == 0) throw new Error('setAdmin: AdminInterface: address 0: ' + name);
  }
}

function setAdmin(adminName, adminPassword, aiAddress, adminAddress) {
  return function (scope) {
    rest.verbose('setAdmin', adminName, adminPassword, aiAddress, adminAddress);
    if(aiAddress && adminAddress) {
      return nop(scope)
        .then(function(scope){
          scope.users[adminName] = {
            address: adminAddress,
            password: adminPassword
          }
          return scope;
        })
        .then(getAdminInterface(aiAddress))
        .then(function (scope) {
          testAdminInterface(scope);
          return scope;
        });
    }
    return nop(scope)
      .then(rest.createUser(adminName, adminPassword))
      .then(getAdminInterface(aiAddress))
      .then(function (scope) {
        testAdminInterface(scope);
        return scope;
      });
  }
}

// ========== Admin Interface ==========
const AI = {
  libPath: undefined,
  subContractsNames: {
    UserManager: 'UserManager',
    ProjectManager: 'ProjectManager',
  },
  contractName: 'AdminInterface',
  contractFilename: '/admin/AdminInterface.sol',
};

function setAdminInterface(adminName, adminPassword) {
  rest.verbose('setAdminInterface', arguments);
  const contractName = AI.contractName;
  const contractFilename = AI.libPath + AI.contractFilename;
  return function (scope) {
    return nop(scope)
      .then(rest.createUser(adminName, adminPassword))
      .then(rest.getContractString(contractName, contractFilename))
      .then(rest.uploadContract(adminName, adminPassword, contractName))
      .then(function (scope) {
        const address = scope.contracts[contractName].address;
        if (!util.isAddress(address)) throw new Error('setAdminInterface: upload failed: address:', address);
        return scope;
      });
  }
}

function getAdminInterface(address) {
  rest.verbose('getAdminInterface', {address});
  return function (scope) {
    const contractName = AI.contractName;
    // if address not passed in, it is in the scope
    if (address === undefined) {
      address = scope.contracts[AI.contractName].address;
      if (address === undefined) throw('');
    }
    return rest.getState(contractName, address)(scope)
      .then(function (scope) {
        for (var name in scope.states[contractName]) {
          var address = scope.states[contractName][name];
          if (address == 0) throw new Error(`getAdminInterface: interface not set: ${name}`);
          // capitalize first letter to match the contract name on the chain
          var capName = name[0].toUpperCase() + name.substring(1);
          scope.contracts[capName] = {
            address: address
          };
        }
        ;
        return scope;
      });
  }
}

function compileSearch() {
  return function (scope) {
    return nop(scope)
      .then(projectManager.compileSearch())
      .then(userManager.compileSearch());
  }
}

// ========== util ==========

// setup the common containers in the scope
function setScope(scope) {
  if (scope === undefined) scope = {};
  return new Promise(function (resolve, reject) {
    rest.setScope(scope).then(function (scope) {
      // add project specific scope items here
      scope.name = 'Supply Chain Demo';
      resolve(scope);
    });
  });
}

function nop(scope) {
  return new Promise(function (resolve, reject) {
    resolve(scope);
  });
}

// =========================== business functions ========================

function login(adminName, username, password) {
  return function(scope) {
    rest.verbose('dapp: login', {username, password});
    return setScope(scope)
    .then(userManager.login(adminName, username, password))
    .then(function(scope) {
        // auth failed
        if (!scope.result) {
          scope.result = {authenticate: false};
          return scope;
        }
        // auth OK
        return userManager.getUser(adminName, username)(scope)
          .then(function(scope) {
            const user = scope.result;
            scope.result = {authenticate: true, user: user};
            return scope;
          })
      });
  }
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
function getBalance(adminName, username) {
  return function(scope) {
    rest.verbose('dapp: getBalance', username);
    return setScope(scope)
      .then(userManager.getBalance(adminName, username));
  }
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
  AI.libPath = libPath;

  return {
    AI: AI,
    compileSearch: compileSearch,
    getAdminInterface: getAdminInterface,
    setAdmin: setAdmin,
    setAdminInterface: setAdminInterface,
    setScope: setScope,
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
