const ba = require('blockapps-rest');
const rest = ba.rest;
const util = ba.common.util;
const config = ba.common.config;

const contractName = 'User';
const contractFilename = `${config.libPath}/user/contracts/User.sol`;

const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;
const UserRole = rest.getEnums(`${config.libPath}/user/contracts/UserRole.sol`).UserRole;

function* uploadContract(admin, args, chainId) {
  const contract = yield rest.uploadContract(admin, contractName, contractFilename, args, chainId);
  yield compileSearch(contract);
  contract.src = 'removed';
  return setContract(admin, contract, chainId);
}

function setContract(admin, contract, chainId) {
  contract.getState = function* (chainId) {
    return yield rest.getState(contract, chainId);
  }
  contract.authenticate = function* (pwHash, chainId) {
    return yield authenticate(admin, contract, pwHash, chainId);
  }
  return contract;
}

function* compileSearch(contract) {
  rest.verbose('compileSearch', contract.codeHash);
  if (yield rest.isSearchable(contract.codeHash)) {
    return;
  }

  const searchable = [contractName];
  yield rest.compileSearch(searchable, contractName, contractFilename);
}

function* getUsers(addresses) {
  const csv = util.toCsv(addresses); // generate csv string
  const results = yield rest.query(`${contractName}?address=in.${csv}`);
  return results;
}

function* getUserById(id, chainId) {
  const baUser = (yield rest.waitQuery(`${contractName}?id=eq.${id}&chainId=eq.${chainId}`, 1))[0];
  return baUser;
}

function* getUserByAddress(address, chainId) {
  const baUser = (yield rest.waitQuery(`${contractName}?chainId=eq.${chainId}&address=eq.${address}`, 1))[0];
  return baUser;
}

function* authenticate(admin, contract, pwHash, chainId) {
  rest.verbose('authenticate', pwHash, chainId);
  // function authenticate(bytes32 _pwHash) return (bool) {
  const method = 'authenticate';
  const args = {
    _pwHash: pwHash,
  };
  const result = yield rest.callMethod(admin, contract, method, args, undefined, chainId);
  const isAuthenticated = (result[0] === true);
  return isAuthenticated;
}


module.exports = {
  uploadContract: uploadContract,
  compileSearch: compileSearch,

  // constants
  contractName: contractName,
  ErrorCodes: ErrorCodes,
  UserRole: UserRole,

  // business logic
  authenticate: authenticate,
  getUserByAddress: getUserByAddress,
  getUsers: getUsers,
  getUserById: getUserById,
  contractName: contractName,
};
