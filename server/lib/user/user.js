const ba = require('blockapps-rest');
const rest = ba.rest;
const util = ba.common.util;
const config = ba.common.config;

const contractName = 'User';
const contractFilename = `${config.libPath}/user/contracts/User.sol`;

const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;
const UserRole = rest.getEnums(`${config.libPath}/user/contracts/UserRole.sol`).UserRole;

function* compileSearch(onlyIfNotCompiled) {
  // if only first time, but alreay compiled - bail
  if (onlyIfNotCompiled  &&  (yield isCompiled())) {
    return;
  }
  // compile
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

function* getUserById(id) {
  const baUser = (yield rest.waitQuery(`${contractName}?id=eq.${id}`, 1))[0];
  return baUser;
}

function* getUserByAddress(address) {
  const baUser = (yield rest.waitQuery(`${contractName}?address=eq.${address}`, 1))[0];
  return baUser;
}

function* authenticate(admin, contract, pwHash) {
  rest.verbose('authenticate', pwHash);
  // function authenticate(bytes32 _pwHash) return (bool) {
  const method = 'authenticate';
  const args = {
    _pwHash: pwHash,
  };
  const result = yield rest.callMethod(admin, contract, method, args);
  const isAuthenticated = (result[0] === true);
  return isAuthenticated;
}


module.exports = {
  compileSearch: compileSearch,
  getState: getState,
  getUserByAddress: getUserByAddress,
  getUserById: getUserById,
  uploadContract: uploadContract,
  isCompiled: isCompiled,

  // constants
  contractName: contractName,
  ErrorCodes: ErrorCodes,
  UserRole: UserRole,

  // business logic
  authenticate: authenticate,
};
