require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;
const util = common.util;
const should = common.should;
const assert = common.assert;
const Promise = common.Promise;

const txJs = require('../tx');

const adminName = util.uid('Admin');
const adminPassword = '1234';

describe('Transaction tests', function() {
  this.timeout(config.timeout);

  var admin;

  before(function*() {
    admin = yield rest.createUser(adminName, adminPassword);
    // compile if needed
    yield txJs.compileSearch(true);
  })

  it('Create Offset Transaction', function* () {
    const uid = util.uid();
    const txId = new Date().getTime();
    const email = `Email_${uid}`;
    const fractions = 2; // how many fractions
    const projectId = 7;

    // project{id} => CPA{id} => purchases{id} -> available tonnage

    // function OffsetTx(uint txId, string email, uint fractions, projectId) {
    const args = {
      _txId: txId,
      _email: email,
      _fractions: fractions,
      _projectId: projectId,
    };

    // create the OffsetTx with constructor args
    const contract = yield txJs.uploadContract(admin, args);
    const offsetTx = yield txJs.getState(contract);
    assert.equal(offsetTx.txId, txId, 'txId');
    assert.equal(offsetTx.email, email, 'email');
    assert.equal(offsetTx.fractions, fractions, 'fractions');
    assert.equal(offsetTx.projectId, projectId, 'projectId');
  });

  it('Search Offset Transaction', function* () {
    const uid = util.uid();
    const txId = new Date().getTime();
    const email = `Email_${uid}`;
    const fractions = 2; // how many fractions
    const projectId = 7;

    // function OffsetTx(string email, uint fractions, projectId) {
    const args = {
      _txId: txId,
      _email: email,
      _fractions: fractions,
      _projectId: projectId,
    };

    // create the user with constructor args
    const contract = yield txJs.uploadContract(admin, args);
    // search
    const offsetTx = yield txJs.getOffsetTx(txId);

    assert.equal(offsetTx.txId, txId, 'txId');
    assert.equal(offsetTx.email, email, 'email');
    assert.equal(offsetTx.fractions, fractions, 'fractions');
    assert.equal(offsetTx.projectId, projectId, 'projectId');
  });
});
