require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;
const util = common.util;
const should = common.should;
const assert = common.assert;
const constants = common.constants;
const BigNumber = common.BigNumber;
const Promise = common.Promise;

const txManagerJs = require('../txManager');
const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;

const adminName = util.uid('Admin');
const adminPassword = '1234';

describe('TxManager tests', function() {
  this.timeout(config.timeout);

  var admin;
  var contract;

  // get ready:  admin-user and manager-contract
  before(function* () {
    admin = yield rest.createUser(adminName, adminPassword);
    contract = yield txManagerJs.uploadContract(admin);
    contract.src = 'removed';
    yield txManagerJs.compileSearch(true);
  });

  it('Create Offset Transaction', function* () {
    const args = createOffsetTxArgs();
    const offsetTx = yield txManagerJs.createOffsetTx(admin, contract, args);
    assert.equal(offsetTx.email, args.email, 'email');
    assert.equal(offsetTx.fractions, args.fractions, 'fractions');
    assert.equal(offsetTx.projectId, args.projectId, 'projectId');
  });
});

// function createUser(address account, string username, bytes32 pwHash, UserRole role) returns (ErrorCodes) {
function createOffsetTxArgs() {
  const uid = util.uid();
  const email = `Email_${uid}`
  const fractions = 3;
  const projectId = 2345;
  const args = {
    email: email,
    fractions: fractions,
    projectId: projectId,
  }
  return args;
}
