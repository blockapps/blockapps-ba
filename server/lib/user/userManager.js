const ba = require('blockapps-rest');
const rest = ba.rest;
const util = ba.common.util;
const BigNumber = ba.common.BigNumber;
const config = ba.common.config;

const contractName = 'UserManager';
const contractFilename = `${config.libPath}/user/contracts/UserManager.sol`;

const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;
const UserRole = rest.getEnums(`${config.libPath}/user/contracts/UserRole.sol`).UserRole;
//const userContractName = require('./user').contractName;

var admin;

function* uploadContract(args) {
  const contract = yield rest.uploadContract(admin, contractName, contractFilename, args);
  yield compileSearch();
  contract.src = 'removed';

  contract.getState = function* () {
    return yield rest.getState(contract);
  }
  contract.createUser = function* (args) {
    return yield createUser(admin, contract, args);
  }
  contract.exists = function* (username) {
    return yield exists(admin, contract, username);
  }

  return contract;
}

function* compileSearch() {
  rest.verbose('compileSearch', contractName);
  if (yield rest.isCompiled(contractName)) {
    rest.verbose('compileSearch', contractName + ' already compiled');
    return;
  }

  rest.verbose('compileSearch', contractName + ' not compiled');
  const searchable = [contractName];
  yield rest.compileSearch(searchable, contractName, contractFilename);

  const userJs = require('./user')(admin);
  yield userJs.compileSearch();
}

function* getBalance(admin, contract, username, node) {
  rest.verbose('getBalance', username);
  const baUser = yield getUser(admin, contract, username);
  const accounts = yield rest.getAccount(baUser.account);
  const balance = new BigNumber(accounts[0].balance);
  return balance;
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
  baUser.blocUser = blocUser;
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
  const userJs = require('./user')(admin);
  const baUser = yield userJs.getUserByAddress(userAddress);
  return baUser;
}

function* getUsers(admin, contract) {
  rest.verbose('getUsers');
  const state = yield getState(contract);
  const users = state.users;
  const csv = util.toCsv(users); // generate csv string
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

module.exports = function (_admin) {
  admin = _admin;
  return {
    uploadContract: uploadContract,
    compileSearch: compileSearch,
    getBalance: getBalance,
    getUser: getUser,
    getUsers: getUsers,
    login: login,
  }
};
