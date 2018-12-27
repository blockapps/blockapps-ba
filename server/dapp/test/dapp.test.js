require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest6;
const common = ba.common;
const config = common.config;
const assert = common.assert;
const fsutil = common.fsutil;
const util = common.util;

const dappJs = require('../dapp');
const jwtDecode = require('jwt-decode');
const utils = require('../../utils');

const accessToken = process.env.ADMIN_TOKEN;

describe('User tests', function () {
  this.timeout(config.timeout);

  let chainID;
  const deployFilename = 'testdeploy.' + util.uid() + '.yaml';

  before(function* () {
    // decode and create new account
    const decodedToken = jwtDecode(accessToken);
    const userEmail = decodedToken['email'];
    const userCreated = yield utils.createUser(accessToken, userEmail);

    const chain = {
      label: 'My chain label',
      src: 'contract Governance { }',
      args: {},
      members: [{
        address: userCreated.address,
        enode: "enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303?discport=30303"
      }],
      balances: [{
        address: userCreated.address,
        balance: 500000000000000000000000000000000000000000000000000000000000
      }]
    }

    chainID = yield rest.createChain(chain.label, chain.members, chain.balances, chain.src, chain.args);
  });

  it('get dapp', function* () {
    yield dappJs.uploadContract(accessToken, config.libPath, chainID);
  });

  it('deploy dapp', function* () {
    const dapp = yield dappJs.uploadContract(accessToken, config.libPath, chainID);
    yield dapp.deploy(config.dataFilename, deployFilename, chainID);
  });

  it('deploy dapp', function* () {
    const deployment = fsutil.yamlSafeLoadSync(deployFilename);
    assert.isDefined(deployment);
    const chainDetails = deployment[chainID];
    yield dappJs.setContract(chainDetails.admin, chainDetails.contract, chainID);
  });

});
