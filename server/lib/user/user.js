const ba = require('blockapps-rest');
const rest = ba.rest;
const util = ba.common.util;
const config = ba.common.config;

const contractName = 'User';
const contractFilename = `${config.libPath}/user/contracts/User.sol`;

const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;
const UserRole = rest.getEnums(`${config.libPath}/user/contracts/UserRole.sol`).UserRole;

function* uploadContract(admin, args) {
  const contract = yield rest.uploadContract(admin, contractName, contractFilename, args);
  yield compileSearch(contract);
  contract.src = 'removed';
  return setContract(admin, contract);
}

function setContract(admin, contract) {
  contract.getState = function* () {
    return yield rest.getState(contract);
  }
  contract.authenticate = function* (pwHash) {
    return yield authenticate(admin, contract, pwHash);
  }
  return contract;
}

function* compileSearch(contract) {
  rest.verbose('compileSearch', contract.codeHash);
  if (yield rest.isCompiled(contract.codeHash)) {
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
