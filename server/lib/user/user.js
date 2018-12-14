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

function* getUserByAccount(address, chainId) {
  const baUser = (yield rest.waitQuery(`${contractName}?chainId=eq.${chainId}&account=eq.${address}`, 1))[0];
  return baUser;
}

module.exports = {
  uploadContract: uploadContract,
  compileSearch: compileSearch,

  // constants
  contractName: contractName,
  ErrorCodes: ErrorCodes,
  UserRole: UserRole,

  // business logic
  getUserByAddress: getUserByAddress,
  getUserByAccount: getUserByAccount,
  getUsers: getUsers,
  getUserById: getUserById,
  contractName: contractName,
};
