require('co-mocha');
const ba = require('blockapps-rest');
const common = ba.common;
const assert = common.assert;
const config = common.config;
const poster = require('../poster');

const userAccessToken1 = process.env.USER_ACCESS_TOKEN_1;

describe('Me Controller Test', function () {
  this.timeout(config.timeout);
  
  it('should return strato user address of accesstoken', function* () {
    const url = `/me`;
    const data = yield poster.get(url, userAccessToken1);

    assert.equal(data.status, 'success', `should return success`);
    assert.exists(data.address, 'address needs to be exists');
  });

});