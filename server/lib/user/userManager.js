const ba = require('blockapps-rest');
const rest = ba.rest;
const util = ba.common.util;
const BigNumber = ba.common.BigNumber;
const config = ba.common.config;

const contractName = 'UserManager';
const contractFilename = `${config.libPath}/user/contracts/UserManager.sol`;
const user = require('./user');

const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;
const UserRole = rest.getEnums(`${config.libPath}/user/contracts/UserRole.sol`).UserRole;
const userContractName = require('./user').contractName;

function* compileSearch() {
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


function getAccount(account, node) {
  return function (scope) {
    rest.verbose('getAccount', account);
    return rest.setScope(scope)
      .then(function(scope){
        return rest.getAccount(account, node)(scope);
      })
      .then(function (scope) {
        scope.result = scope.accounts[account][0];
        return scope;
      });
  }
}

function getBalance(adminName, username, node) {
  return function (scope) {
    rest.verbose('getBalance', username);
    return rest.setScope(scope)
      .then(getUser(adminName, username))
      .then(function(scope) {
        const user = scope.result;
        const accountAddress = user.account;
        return getBalanceAddress(accountAddress)(scope);
      });
  }
}

function getBalanceAddress(accountAddress) {
  return function (scope) {
    rest.verbose('getBalance', accountAddress);
    return rest.setScope(scope)
      .then(function(scope){
        return getAccount(accountAddress)(scope);
      })
      .then(function(scope){
        const account = scope.result;
        const balance = new BigNumber(account.balance);
        scope.result = balance;
        return scope;
      })
  }
}

// throws: ErrorCodes
// returns: user record from search
function* createUser(admin, contract, args) {
  rest.verbose('createUser', args);

  // create bloc user
  const blocUser = yield rest.createUser(args.username, args.password);
  args.account = blocUser.address;
  args.pwHash = util.toBytes32(args.password); // FIXME this is not a hash

  // function createUser(address account, string username, bytes32 pwHash, UserRole role) returns (ErrorCodes) {
  const method = 'createUser';

  // create the user, with the eth account
  const result = yield rest.callMethod(admin, contract, method, args);
  const errorCode = parseInt(result[0]);
  if (errorCode != ErrorCodes.SUCCESS) {
    throw new Error(errorCode);
  }
  // block until the user shows up in search
  const baUser = yield getUser(admin, contract, args.username);
  return baUser;
}

function* exists(admin, contract, username) {
    rest.verbose('exists', username);
    // function exists(string username) returns (bool) {
    const method = 'exists';
    const args = {
      username: username,
    };
    const result = yield rest.callMethod(admin, contract, method, args);
    const exist = (result[0] === true);
    return exist;
}

function* getUser(admin, contract, username) {
  rest.verbose('getUser', username);
  // function getUser(string username) returns (address) {
  const method = 'getUser';
  const args = {
    username: username,
  };

  // get the use address
  const userAddress = (yield rest.callMethod(admin, contract, method, args))[0];
  if (userAddress == 0) {
    throw new Error(ErrorCodes.NOT_FOUND);
  }
  // found - query for the full user record
  const baUser = yield user.getUserByAddress(userAddress);
  return baUser;
}

function* getUsers(admin, contract) {
  rest.verbose('getUsers');
  const state = yield getState(contract);
  const users = state.users;
  const trimmed = util.trimLeadingZeros(users); // FIXME leading zeros bug
  const csv = util.toCsv(trimmed); // generate csv string
  const results = yield rest.query(`${userContractName}?address=in.${csv}`);
  return results;
}

function* login(admin, contract, args) {
  rest.verbose('login', args);

  // function login(string username, bytes32 pwHash) returns (bool) {
  const method = 'login';
  args.pwHash = util.toBytes32(args.password);
  const result = (yield rest.callMethod(admin, contract, method, args))[0];
  const isOK = (result == true);
  return isOK;
}

module.exports = {
  compileSearch: compileSearch,
  isCompiled: isCompiled,
  getState: getState,
  uploadContract: uploadContract,
  getAccount: getAccount,
  getBalance: getBalance,
  getBalanceAddress: getBalanceAddress,
  createUser: createUser,
  exists: exists,
  getUser: getUser,
  getUsers: getUsers,
  login: login,
};
