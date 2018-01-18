require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const api = common.api;
const config = common.config;
const util = common.util;
const fsutil = common.fsutil;
const should = common.should;
const assert = common.assert;
const Promise = common.Promise;

const dappJs = require('../dapp');

const adminName = util.uid('Admin');
const adminPassword = '1234';

describe('User tests', function() {
  this.timeout(config.timeout);

  let admin;
  const deployFilename = 'testdeploy.' + util.uid() + '.yaml';

  before(function*() {
    admin = yield rest.createUser(adminName, adminPassword);
  });

  it('get dapp', function* () {
    const contract = yield dappJs.uploadContract(admin, config.libPath);
  });

  it('deploy dapp', function* () {
    const dapp = yield dappJs.uploadContract(admin, config.libPath);
    const deployment = yield dapp.deploy(config.dataFilename, deployFilename);
  });

  it('deploy dapp', function* () {
    const deployment = fsutil.yamlSafeLoadSync(deployFilename);
    assert.isDefined(deployment);
    const dapp = yield dappJs.setContract(deployment.admin, deployment.contract);
  });

});
