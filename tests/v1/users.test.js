require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest6;
const common = ba.common;
const config = common.config;
const assert = ba.common.assert;

const dappJs = require('../../server/dapp/dapp');
const poster = require('../poster');
const utils = require('../../server/utils');
const { createChainArgs } = require('../utils/chain');

const userAccessToken1 = process.env.USER_ACCESS_TOKEN_1;
const userAccessToken2 = process.env.USER_ACCESS_TOKEN_2;

describe("User Test", function () {
  this.timeout(config.timeout);

  let chainID, stratoUser1, stratoUser2;

  before(function* () {
    this.timeout(config.timeout);

    // decode and create new account
    const userEmail = utils.getEmailIdFromToken(userAccessToken1);
    stratoUser1 = yield utils.createUser(userAccessToken1, userEmail);

    // decode and create new account
    const userEmail1 = utils.getEmailIdFromToken(userAccessToken2);
    stratoUser2 = yield utils.createUser(userAccessToken2, userEmail1);

    const chain = createChainArgs([stratoUser1.address, stratoUser2.address]);
    chainID = yield rest.createChain(chain.label, chain.members, chain.balances, chain.src, chain.args);

    // NOTE: This will carry mockdata of chains and user
    config.deployFilename = `./tests/mock/chainsMock.deploy.yaml`;

    const dapp = yield dappJs.uploadContract(userAccessToken1, config.libPath, chainID);
    yield dapp.deploy(config.dataFilename, config.deployFilename, chainID);
    yield dapp.createUser({ address: stratoUser1.address, role: 'SUPPLIER' }, chainID);
  });

  it('should return user balance', function* () {
    this.timeout(config.timeout);
    const url = `/users/${stratoUser1.address}/balance?chainId=${chainID}`;

    const response = yield poster.get(url, userAccessToken1);
    assert.exists(response.balance, "balance must be exists");
  });

  it('get created user', function* () {
    this.timeout(config.timeout);
    const url = `/users/${stratoUser1.address}?chainId=${chainID}`;
    const response = yield poster.get(url, userAccessToken1);

    // 'SUPPLIER' role is 3
    assert.equal(response.user.role, 3, "role must be SUPPLIER (3)");
    assert.equal(response.user.account, stratoUser1.address, "address must be same as strato user");
  });
});
