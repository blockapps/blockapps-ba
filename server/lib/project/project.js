const ba = require('blockapps-rest');
const rest = ba.rest;
const util = ba.common.util;
const config = ba.common.config;

const contractName = 'Project';
const contractFilename = `${config.libPath}/project/contracts/Project.sol`;

const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;

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

function* getProjectByName(name) {
  return (yield rest.waitQuery(`${contractName}?name=eq.${encodeURIComponent(name)}`, 1))[0];
}

function* getProjectByAddress(address) {
  return (yield rest.waitQuery(`${contractName}?address=eq.${address}`, 1))[0];
}


module.exports = {
  compileSearch: compileSearch,
  getState: getState,
  uploadContract: uploadContract,
  isCompiled: isCompiled,
  getProjectByName: getProjectByName,
  // constants
  contractName: contractName,
};
