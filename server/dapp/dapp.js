const ba = require('blockapps-rest');
const rest = ba.rest;
const util = ba.common.util;
const config = ba.common.config;
const Promise = ba.common.Promise;

const userManager = require(process.cwd() + '/' + config.libPath + '/user/userManager');
const projectManager = require(process.cwd() + '/' + config.libPath + '/project/projectManager');
const bid = require(process.cwd() + '/' + config.libPath + '/bid/bid');

// ========== Admin (super user) ==========

function setAdmin(adminName, adminPassword, aiAddress) {
  return function (scope) {
    rest.verbose('setAdmin', adminName, adminPassword, aiAddress);
    return nop(scope)
      .then(rest.createUser(adminName, adminPassword))
      .then(getAdminInterface(aiAddress))
      .then(function (scope) {
        for (var name in AI.subContractsNames) {
          if (scope.contracts[name] === undefined) throw new Error('setAdmin: AdminInterface: undefined: ' + name);
          if (scope.contracts[name] === 0) throw new Error('setAdmin: AdminInterface: 0: ' + name);
          if (scope.contracts[name].address == 0) throw new Error('setAdmin: AdminInterface: address 0: ' + name);
        }
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

function createProject(adminName, name, buyer) {
  return function(scope) {
    rest.verbose('dapp: createProject', {adminName, name, buyer});
    return setScope(scope)
      .then(projectManager.createProject(adminName, name, buyer));
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
    getProjects: getProjects,
    getProjectsByBuyer: getProjectsByBuyer,
    getProjectsByState: getProjectsByState,
    createBid: createBid,
    getProject: getProject,
  };
};
