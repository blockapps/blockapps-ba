require('co-mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;
const util = common.util;
const should = ba.common.should;
const assert = ba.common.assert;
const expect = ba.common.expect;
const constants = common.constants;
const BigNumber = common.BigNumber;
const fs = require('fs');

const dappJs = require('../../server/dapp/dapp');

chai.use(chaiHttp);

describe("User Test", function () {
  const username = util.uid('Supplier1');
  const password = "1234";
  const timeout = 60000;
  this.timeout(timeout);

  before(function* () {
    admin = yield rest.createUser(username, password);
    user = yield rest.createUser(util.uid('Supplier1'), password);

    const chain = {
      label: `test airline ${util.uid()}`,
      src: 'contract Governance { }',
      args: {},
      members: [
        {
          address: admin.address,
          enode: "enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303?discport=30303"
        },
        {
          address: user.address,
          enode: "enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303?discport=30303"
        }
      ],
      balances: [
        {
          address: admin.address,
          balance: 1000000000000000000000000
        },
        {
          address: user.address,
          balance: 1000000000000000000000000
        }
      ]
    }

    chainID = yield rest.createChain(chain.label, chain.members, chain.balances, chain.src, chain.args);

    // NOTE: This will carry mockdata of chains and user
    config.deployFilename = `./tests/mock/chainsMock.deploy.yaml`;
    config.usersFilename = `./tests/mock/usersMock.deploy.yaml`;

    fs.appendFile(config.usersFilename, '', function (err) {
      if (err) throw err;
      console.log('Saved!');
    });

    const dapp = yield dappJs.uploadContract(admin, config.libPath, chainID);
    yield dapp.deploy(config.dataFilename, config.deployFilename, chainID);
    yield dapp.createUser({ username: admin.name, password: admin.password, role: 'SUPPLIER', address: admin.address }, chainID);
  });

  it('should return user balance', function (done) {
    this.timeout(timeout);
    chai.request(server)
      .get('/api/v1/users/' + admin.name + '/balance')
      .query({ chainId: chainID })
      .end((err, res) => {
        const data = assert.apiData(err, res);
        const balance = data.balance;
        const faucetBalance = new BigNumber(1000).times(constants.ETHER);
        balance.should.be.bignumber.equal(faucetBalance);
        done();
      });
  });

  it('create user: should create new user', function (done) {
    this.timeout(timeout);
    chai.request(server)
      .post('/api/v1/users/create')
      .send({ chainId: chainID, username: user.name, address: user.address, password: user.password, role: 'SUPPLIER' })
      .end((err, res) => {
        const data = assert.apiData(err, res);
        assert.equal(data, 'User created successfully', 'create user should contain message');
        done();
      });
  });

  it('create user: account already exists', function (done) {
    this.timeout(config.timeout);
    chai.request(server)
      .post('/api/v1/users/create')
      .send({ chainId: chainID, username: admin.name, address: admin.address, password: user.password, role: 'SUPPLIER' })
      .end((err, res) => {
        assert.equal(res.body.error, 'Failed to create user', 'create user should contain message');
        done();
      });
  });
});
