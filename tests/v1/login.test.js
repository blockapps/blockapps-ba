const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const ba = require('blockapps-rest');
const common = ba.common;
const should = common.should;
const assert = common.assert;
const expect = common.expect;
const config = common.config;
const rest = ba.rest;
const UserRole = rest.getEnums(`${config.libPath}/user/contracts/UserRole.sol`).UserRole;

chai.use(chaiHttp);

describe("Login Test", function(){
  const username = "Supplier1";
  const password = "1234";
  const timeout = 20 * 1000;

  it('should fail to login with wrong password', function(done) {
    this.timeout(timeout);
    chai.request(server)
      .post('/api/v1/login')
      .send({
        username: username ,
        password: password + 'x',
      })
      .end((err, res) => {
        assert.equal(res.statusCode, 401, 'Login should fail');
        done();
      });
  });

  it('should fail to login with wrong username', function(done) {
    this.timeout(timeout);
    chai.request(server)
      .post('/api/v1/login')
      .send({
        username: username + 'x',
        password: password ,
      })
      .end((err, res) => {
        assert.equal(res.statusCode, 401, 'Login should fail');
        done();
      });
  });

  it('should log the user in', function(done) {
    this.timeout(timeout);
    chai.request(server)
      .post('/api/v1/login')
      .send({
        username: username,
        password: password,
      })
      .end((err, res) => {
        const data = assert.apiData(err, res);
        const authenticate = data.authenticate;
        const user = data.user;

        assert.isOk(authenticate, 'Should be authenticated');
        assert.equal(user.username, username, 'Username should be ' + username);
        assert.equal(parseInt(user.role), UserRole.SUPPLIER, 'Role should be Supplier');
        done();
      });
  });
});
