const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const ba = require('blockapps-rest');
const common = ba.common;
const should = ba.common.should;
const assert = ba.common.assert;
const expect = ba.common.expect;
const config = common.config;
const UserRole = ba.rest.getEnums(`${config.libPath}/user/contracts/UserRole.sol`).UserRole;

chai.use(chaiHttp);

describe("Login Test", function(){
  const username = "Supplier1";
  const password = "1234";
  const timeout = 20 * 1000;

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
        assert.equal(user.role, "SUPPLIER", 'Role should be Supplier');
        done();
      });
  });

  it('should signup user', function(done) {
    const newUser = "Supplier" + Math.round(Math.random() * 1234567890).toString();
    this.timeout(timeout);
    chai.request(server)
      .post('/api/v1/login/signup')
      .send({
        username: newUser,
        password: password,
        role: UserRole.SUPPLIER
      })
      .end((err, res) => {
        const data = assert.apiData(err, res);
        console.log(data);
        const user = data.user;

        assert.equal(user.username, newUser, 'Username should be ' + newUser);
        assert.equal(user.role, "SUPPLIER", 'Role should be Supplier');
        done();
      });
  });

  it('should fail to signup an existing user', function(done) {
    const newUser = "Supplier1"
    this.timeout(timeout);
    chai.request(server)
      .post('/api/v1/login/signup')
      .send({
        username: newUser,
        password: password,
        role: UserRole.SUPPLIER
      })
      .end((err, res) => {
        expect(err).to.exist;
        done();
      });
  });
});
