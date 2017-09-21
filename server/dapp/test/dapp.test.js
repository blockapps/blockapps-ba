require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const api = common.api;
const config = common.config;
const util = common.util;
const should = common.should;
const assert = common.assert;
const Promise = common.Promise;

const dappJs = require('../dapp')(config.libPath);

const adminName = util.uid('Admin');
const adminPassword = '1234';

describe('User tests', function() {
  this.timeout(config.timeout);

  let admin;

  before(function*() {
    admin = yield rest.createUser(adminName, adminPassword);
  });

  it('get dapp', function* () {
    const contract = yield dappJs.uploadContract(admin);
    console.log(contract);
  });

});
