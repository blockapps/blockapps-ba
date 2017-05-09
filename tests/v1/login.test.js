const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const ba = require('blockapps-rest');
const common = ba.common;
const should = ba.common.should;
const assert = ba.common.assert;
const expect = ba.common.expect;

chai.use(chaiHttp);

function assert_noerr(err) {
  assert.equal(err, null, JSON.stringify(err, null, 2));
}

function assert_apiError(res, status, mustContain) {
  res.should.be.json;
  assert.notStrictEqual(res.body.success, undefined, 'Malformed body: success undefined');
  assert.notOk(res.body.success, `API success should be false: ${JSON.stringify(res.body, null, 2)}`);
  assert.equal(res.status, status, `HTTP status should be ${status} ${JSON.stringify(res.body.error)}`);
  assert.notStrictEqual(res.body.error, undefined, 'Malformed body: error undefined');
  const message = res.body.error.toLowerCase();
  assert.isAtLeast(message.indexOf(mustContain.toLowerCase()), 0, `error '${message}' must contain '${mustContain}' `);
}

function assert_apiSuccess(res) {
  res.should.be.json;
  assert.notStrictEqual(res.body.success, undefined, 'Malformed body: success undefined');
  assert.ok(res.body.success, `API success should be true ${JSON.stringify(res.body, null, 2)}`);
  assert.equal(res.status, 200, `HTTP status should be 200`);
  assert.strictEqual(res.body.error, undefined, `Error should be undefined `);
}

describe("Login Test", function(){
  const username = "Supplier1";
  const password = "1234";
  const timeout = 20 * 1000;

  it('should log the user in', function(done) {
    this.timeout(timeout);
    chai.request(server)
      .post('/api/v1/login')
      .send({
        username,
        password
      })
      .end((err, res) => {
        assert_noerr(err);
        assert_apiSuccess(res);
        res.body.should.have.property('data');
        const data = res.body.data;
        const authenticate = data.authenticate;
        const user = data.user;
        assert.isOk(authenticate, 'Should be authenticated');
        assert.equal(user.username, username, 'Username should be ' + username);
        assert.equal(user.role, "Supplier", 'Role should be Supplier');
        done();
      });
  });

});
