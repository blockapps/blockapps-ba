require('co-mocha');
const ba = require('blockapps-rest');
const common = ba.common;
const assert = common.assert;
const config = common.config;
const poster = require('../poster');
const utils = require('../../server/utils');

const userAccessToken1 = process.env.USER_ACCESS_TOKEN_1;

describe('Me Controller Test', function () {
  this.timeout(config.timeout);

  before(function* () {
    // decode and create new account
    const userEmail = utils.getEmailIdFromToken(userAccessToken1);
    stratoUser1 = yield utils.createUser(userAccessToken1, userEmail);
  });

  it('should return strato user address of accesstoken', function* () {
    this.timeout(config.timeout);

    const url = `/me`;
    const data = yield poster.get(url, userAccessToken1);

    assert.equal(data.status, 'success', `should return success`);
    assert.exists(data.address, 'address needs to be exists');
  });

});