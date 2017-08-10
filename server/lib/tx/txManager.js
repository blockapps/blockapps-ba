const ba = require('blockapps-rest');
const rest = ba.rest;
const util = ba.common.util;
const BigNumber = ba.common.BigNumber;
const config = ba.common.config;

const contractName = 'TxManager';
const contractFilename = `${config.libPath}/tx/contracts/TxManager.sol`;

const txJs = require('./tx');
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

// throws: ErrorCodes
// returns: tx record from search
function* createOffsetTx(admin, contract, args) {
  rest.verbose('createOffsetTx', args);

  // function createOffsetTx(string email, uint fractions, uint projectId) returns (ErrorCodes, uint) {
  const method = 'createOffsetTx';

  // create the tx
  const result = yield rest.callMethod(admin, contract, method, args);
  const errorCode = parseInt(result[0]);
  if (errorCode != ErrorCodes.SUCCESS) {
    throw new Error(errorCode);
  }
  // block until the user shows up in search
  const txId = result[1];

  const offsetTx = yield txJs.getOffsetTx(txId);
  return offsetTx;
}

module.exports = {
  compileSearch: compileSearch,
  isCompiled: isCompiled,
  getState: getState,
  uploadContract: uploadContract,
  createOffsetTx: createOffsetTx,
};
