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

describe('Authentication Test', function () {
  this.timeout(config.timeout);

  it('callback should redirect to root when called with valid user code', function (done) {
    this.timeout(config.timeout);

    const userCode = 'user1-code';
    const url = `/api/v1/authentication/callback?code=${userCode}`;

    chai.request(server)
      .get(url)
      .end(function (err, res) {
        // res.redirect('/') redirects to localhost
        assert.equal(res.statusCode, 404, `should return status 404 when not found`);
        // checking if it redirects to root 
        assert.equal(res.error.path, '/', `should have root path`);
        done();
      });

  });

  it('callback should return error when called with invalid user code', function (done) {
    this.timeout(config.timeout);

    const userCode = 'test-user8-code';
    const url = `/api/v1/authentication/callback?code=${userCode}`;

    chai.request(server)
      .get(url)
      .end(function (err, res) {
        // returns 401 on invalid user code
        assert.equal(res.statusCode, 401, `should return status 401`);
        done();
      });

  });

  it('should redirect', function* () {
    this.timeout(config.timeout);
    const url = `/authentication/oauth`;
    const oauthRedirectResponse = yield poster.get(url);
    // URL returned means redirect successful
    assert.exists(oauthRedirectResponse.url, 'url needs to be exists');
  });

  it('should return logout url successfully', function* () {
    this.timeout(config.timeout);
    const url = `/authentication/logout`;
    const oauthLogoutResponse = yield poster.get(url);
    // Logout url returned means logout successfull
    assert.exists(oauthLogoutResponse.logoutUrl, 'logout url needs to be exists');
  });

});