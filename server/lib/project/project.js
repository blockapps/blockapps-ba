const ba = require('blockapps-rest');
const rest = ba.rest;
const util = ba.common.util;
const config = ba.common.config;

const contractName = 'Project';
const contractFilename = `${config.libPath}/project/contracts/Project.sol`;

const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;

function* uploadContract(admin, args) {
  const contract = yield rest.uploadContract(admin, contractName, contractFilename, args);
  yield compileSearch(contract);
  contract.src = 'removed';

  contract.getState = function* () {
    return yield rest.getState(contract);
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

function* getProjectByName(name) {
  return (yield rest.waitQuery(`${contractName}?name=eq.${encodeURIComponent(name)}`, 1))[0];
}

function* getProjectByAddress(address) {
  return (yield rest.waitQuery(`${contractName}?address=eq.${address}`, 1))[0];
}


module.exports = {
  compileSearch: compileSearch,
  uploadContract: uploadContract,
  getProjectByName: getProjectByName,
  // constants
  contractName: contractName,
};
