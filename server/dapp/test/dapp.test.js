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

describe('User tests', function () {
  this.timeout(config.timeout);

  let admin, chainID;
  const deployFilename = 'testdeploy.' + util.uid() + '.yaml';

  before(function* () {
    admin = yield rest.createUser(adminName, adminPassword);

    const chain = {
      label: 'My chain label',
      src: 'contract Governance { }',
      args: {},
      members: [{
        address: admin.address,
        enode: "enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303?discport=30303"
      }],
      balances: [{
        address: admin.address,
        balance: 1000000000000000000000
      }]
    }

    chainID = yield rest.createChain(chain.label, chain.members, chain.balances, chain.src, chain.args);
  });

  it('get dapp', function* () {
    const contract = yield dappJs.uploadContract(admin, config.libPath, chainID);
  });

  it('deploy dapp', function* () {
    const dapp = yield dappJs.uploadContract(admin, config.libPath, chainID);
    const deployment = yield dapp.deploy(config.dataFilename, deployFilename, chainID);
  });

  it('deploy dapp', function* () {
    const deployment = fsutil.yamlSafeLoadSync(deployFilename);
    assert.isDefined(deployment);
    const chainDetails = deployment[chainID];
    const dapp = yield dappJs.setContract(chainDetails.admin, chainDetails.contract, chainID);
  });

});
