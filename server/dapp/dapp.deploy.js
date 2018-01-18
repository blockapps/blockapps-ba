require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;
const util = common.util;
const should = common.should;
const assert = common.assert;
const expect = common.expect;
const Promise = common.Promise;

// ---------------------------------------------------
//   deploy the projects contracts
// ---------------------------------------------------

const dappJs = require('./dapp');

describe('Supply Chain Demo App - deploy contracts', function () {
  this.timeout(900 * 1000);

  assert.isDefined(config.dataFilename, 'Data argument missing. Set in config, or use --data <path>');

  const adminName = util.uid('Admin');  // FIXME
  const adminPassword = '7890';   // FIXME

  // uploading the admin contract and dependencies
  it('should upload the contracts', function* () {
    // get the dapp
    const admin = yield rest.createUser(adminName, adminPassword);
    const dapp = yield dappJs.uploadContract(admin, config.libPath);
    const deployment = yield dapp.deploy(config.dataFilename, config.deployFilename);
  });
});
