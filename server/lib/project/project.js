const ba = require('blockapps-rest');
const rest = ba.rest6;
const util = ba.common.util;
const config = ba.common.config;

const contractName = 'Project';
const contractFilename = `${config.libPath}/project/contracts/Project.sol`;

const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;

function* uploadContract(admin, args, chainId) {
  const contract = yield rest.uploadContract(admin, contractName, contractFilename, args, { chainId });
  yield compileSearch(contract);
  contract.src = 'removed';

  contract.getState = function* (chainId) {
    return yield rest.getState(contract, {chainId});
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

function* getProjectByName(name, chainId) {
  return (yield rest.waitQuery(`${contractName}?chainId=eq.${chainId}&name=eq.${encodeURIComponent(name)}`, 1))[0];
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
