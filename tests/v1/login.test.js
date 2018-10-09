require('co-mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const ba = require('blockapps-rest');
const common = ba.common;
const should = common.should;
const assert = common.assert;
const expect = common.expect;
const config = common.config;
const util = common.util;
const rest = ba.rest;
const UserRole = rest.getEnums(`${config.libPath}/user/contracts/UserRole.sol`).UserRole;
const userManagerJs = require('../../server/lib/user/userManager');
const dappJs = require('../../server/dapp/dapp');

chai.use(chaiHttp);

describe("Login Test", function () {
  this.timeout(config.timeout);

  const username = util.uid("Supplier1");
  const password = "1234";

  before(function* () {
    admin = yield rest.createUser(username, password);

    const chain = {
      label: `test airline ${util.uid()}`,
      src: 'contract Governance { }',
      args: {},
      members: [
        {
          address: admin.address,
          enode: "enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303?discport=30303"
        }
      ],
      balances: [
        {
          address: admin.address,
          balance: 1000000000000000000000000
        }
      ]
    }

    chainID = yield rest.createChain(chain.label, chain.members, chain.balances, chain.src, chain.args);

    config.deployFilename = `./tests/mock/chainsMock.deploy.yaml`;

    const dapp = yield dappJs.uploadContract(admin, config.libPath, chainID);
    const deployment1 = yield dapp.deploy(config.dataFilename, config.deployFilename, chainID);

    yield dapp.createUser({ username: admin.name, password: admin.password, role: 'SUPPLIER', address: admin.address }, chainID);
  });

  it('should fail to login with wrong password', function (done) {
    this.timeout(config.timeout);
    chai.request(server)
      .post('/api/v1/login')
      .send({
        username: username,
        password: password + 'x',
        chainId: chainID
      })
      .end((err, res) => {
        assert.equal(res.statusCode, 401, 'Login should fail');
        done();
      });
  });

  it('should fail to login with wrong username', function (done) {
    this.timeout(config.timeout);
    chai.request(server)
      .post('/api/v1/login')
      .send({
        username: username + 'x',
        password: password,
        chainId: chainID
      })
      .end((err, res) => {
        assert.equal(res.statusCode, 401, 'Login should fail');
        done();
      });
  });

  it('should log the user in', function (done) {
    this.timeout(config.timeout);
    chai.request(server)
      .post('/api/v1/login')
      .send({
        username: admin.name,
        password: admin.password,
        chainId: chainID
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
