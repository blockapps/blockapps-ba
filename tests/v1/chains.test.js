require('co-mocha');
const ba = require('blockapps-rest');
const common = ba.common;
const config = common.config;
const assert = ba.common.assert;

const poster = require('../poster');
const utils = require('../../server/utils');
const { createChainWithArgs } = require('../utils/chain');

const userAccessToken1 = process.env.USER_ACCESS_TOKEN_1;
const userAccessToken2 = process.env.USER_ACCESS_TOKEN_2;

describe("User Test", function () {
  this.timeout(config.timeout);

  let stratoUser1, stratoUser2, chain;

  before(function* () {
    this.timeout(config.timeout);

    // decode and create new account
    const userEmail = utils.getEmailIdFromToken(userAccessToken1);
    stratoUser1 = yield utils.createUser(userAccessToken1, userEmail);

    // decode and create new account
    const userEmail1 = utils.getEmailIdFromToken(userAccessToken2);
    stratoUser2 = yield utils.createUser(userAccessToken2, userEmail1);

    chain = createChainWithArgs([stratoUser1.address, stratoUser2.address]);
    chain.users = [
      { address: stratoUser1.address, role: 'SUPPLIER' },
      { address: stratoUser2.address, role: 'BUYER' }
    ]
  });

  it('should create chain and deploy contracts', function* () {
    this.timeout(config.timeout);
    const url = `/chains`;
    const response = yield poster.post(url, { chain }, userAccessToken1);
    assert.equal(response, 'Chain Created Successfully', "chain and contracts must be deployed");
  });

  it('should return chain list', function* () {
    this.timeout(config.timeout);
    const url = `/chains`;
    const response = yield poster.get(url, userAccessToken1);
    assert.isArray(response, "must be array");
  });

});
