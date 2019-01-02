require('co-mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const server = require(process.cwd() + '/server');
const ba = require('blockapps-rest');
const common = ba.common;
const assert = common.assert;
const config = common.config;
const poster = require('../poster');

const accessToken = process.env.ADMIN_TOKEN;

describe('Me Controller Test', function () {
  this.timeout(config.timeout);
  
  it('should return strato user address of accesstoken', function* () {
    const url = `/me`;
    const data = yield poster.get(url, accessToken);
    assert.equal(data.status, 'success', `should return success`);
    assert.exists(data.address, 'address needs to be exists');
  });

});