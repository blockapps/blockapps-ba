const ba = require('blockapps-rest');
const rest = ba.rest6;
const util = ba.common.util;
const BigNumber = ba.common.BigNumber;
const config = ba.common.config;

const contractName = 'UserManager';
const contractFilename = `${config.libPath}/user/contracts/UserManager.sol`;

const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;
const UserRole = rest.getEnums(`${config.libPath}/user/contracts/UserRole.sol`).UserRole;

function* uploadContract(admin, args, chainId) {
  const contract = yield rest.uploadContract(admin, contractName, contractFilename, args, chainId);
  yield compileSearch(contract);
  contract.src = 'removed';
  return setContract(admin, contract, chainId);
}

function setContract(admin, contract, chainId) {
  contract.getState = function* () {
    return yield rest.getState(contract);
  }
  contract.createUser = function* (args, chainId) {
    return yield createUser(admin, contract, args, chainId);
  }
  contract.exists = function* (username, chainId) {
    return yield exists(admin, contract, username, chainId);
  }
  contract.getUser = function* (username, chainId) {
    return yield getUser(admin, contract, username, chainId);
  }
  contract.getUserByAccount = function* (address, chainId) {
    return yield getUserByAccount(address, chainId);
  }
  contract.getUsers = function* (chainId) {
    return yield getUsers(admin, contract, chainId);
  }
  contract.login = function* (args, chainId) {
    return yield login(admin, contract, args, chainId);
  }
  contract.getBalance = function* (username, chainId, node) {
    return yield getBalance(username, chainId, node);
  }
  return contract;
}

function* compileSearch(contract) {
  rest.verbose('compileSearch', contract.codeHash);
  if (yield rest.isSearchable(contract.codeHash)) {
    return;
  }
  // compile
  const userJs = require('./user');
  const searchable = [userJs.contractName, contractName];
  yield rest.compileSearch(searchable, contractName, contractFilename);
}

function* getBalance(address, chainId, node) {
  rest.verbose('getBalance', address);
  const accounts = yield rest.getAccount(address, {chainId});
  const balance = new BigNumber(accounts[0].balance);
  return balance;
}

// throws: ErrorCodes
// returns: user record from search
function* createUser(admin, contract, args, chainId) {
  rest.verbose('createUser', admin, args, chainId);

    // function createUser(address account, string username, UserRole role) returns (ErrorCodes) {
    const method = 'createUser';

    // create the user, with the eth account
    const result = yield rest.callMethod(admin, contract, method, args, {chainId});
    const errorCode = parseInt(result[0]);
    if (errorCode != ErrorCodes.SUCCESS) {
      throw new Error(errorCode);
    }
    // block until the user shows up in search
    const baUser = yield getUser(admin, contract, args.username, chainId);
    return baUser;
}

function* exists(admin, contract, username, chainId) {
  rest.verbose('exists', username);
  // function exists(string username) returns (bool) {
  const method = 'exists';
  const args = {
    username: username,
  };
  const result = yield rest.callMethod(admin, contract, method, args, undefined, chainId);
  const exist = (result[0] === true);
  return exist;
}

function* getUser(admin, contract, username, chainId) {
  rest.verbose('getUser', username, chainId);
  // function getUser(string username) returns (address) {
  const method = 'getUser';
  const args = {
    username: username,
  };

  // get the use address
  const userAddress = (yield rest.callMethod(admin, contract, method, args, { chainId }))[0];
  if (userAddress == 0) {
    throw new Error(ErrorCodes.NOT_FOUND);
  }
  // found - query for the full user record
  const userJs = require('./user');
  const baUser = yield userJs.getUserByAddress(userAddress, chainId);
  return baUser;
}

function* getUserByAccount(address, chainId) {
  rest.verbose('userManager: getUserByAccount', { address, chainId });
  const userJs = require('./user');
  const results = yield userJs.getUserByAccount(address, chainId);
  return results;
}

function* getUsers(admin, contract, chainId) {
  rest.verbose('getUsers');
  const state = yield rest.getState(contract, chainId);
  const users = state.users;
  const userJs = require('./user');
  const results = yield userJs.getUsers(users, chainId);
  return results;
}

// TODO: Remove it is not in use
function* login(admin, contract, args, chainId) {
  rest.verbose('login', args);

  // function login(string username, bytes32 pwHash) returns (bool) {
  const method = 'login';
  args.pwHash = util.toBytes32(args.password);
  const result = (yield rest.callMethod(admin, contract, method, args, undefined, chainId))[0];
  const isOK = (result == true);
  return isOK;
}

module.exports = {
  uploadContract: uploadContract,
  compileSearch: compileSearch,
  setContract: setContract,
  contractName: contractName,
};
