require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const api = common.api;
const config = common.config;
const util = common.util;
const should = common.should;
const assert = common.assert;
const expect = common.expect;
const Promise = common.Promise;
let admin;

// ---------------------------------------------------
//   deploy the projects contracts
// ---------------------------------------------------

const dappJs = require('./dapp');

describe('Supply Chain Demo App - deploy contracts', function () {
  this.timeout(900 * 1000);

  assert.isDefined(config.dataFilename, 'Data argument missing. Set in config, or use --data <path>');

  before(function*() {
    const adminName = util.uid('Admin');  // FIXME
    const adminPassword = '1234';   // FIXME
    admin = yield rest.createUser(adminName, adminPassword, false);
    var counter,balance = 0
    do {
      yield new Promise(resolve => setTimeout(resolve, 1000))
      counter ++
      var balance = yield rest.getBalance(admin.address)
    } while (balance < 1|| counter == 50);

  });
  // uploading the admin contract and dependencies
  it('should upload the contracts', function* () {
    // get the dapp
    // wait for the transaction to be added to blockchain
    const dapp = yield dappJs.uploadContract(admin, config.libPath);
    const deployment = yield dapp.deploy(config.dataFilename, config.deployFilename);
  });
});
