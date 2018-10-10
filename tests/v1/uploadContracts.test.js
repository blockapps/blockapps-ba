require('co-mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const ba = require('blockapps-rest');
const common = ba.common;
const assert = common.assert;
const config = common.config;
const util = common.util;
const rest = ba.rest;

chai.use(chaiHttp);

describe("UploadContracts Test", function () {
  this.timeout(config.timeout);

  const username = util.uid("Admin");
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
    
  });

  it('should upload Contracts', function (done) {
    this.timeout(config.timeout);
    chai.request(server)
      .post('/api/v1/uploadContracts')
      .send({
        username: admin.name,
        address: admin.address,
        password: admin.password,
        chainId: chainID
      })
      .end((err, res) => {
        assert.equal(res.statusCode, 200, 'contracts upload success');
        done();
      });
  });

  it('should throw an contracts already deployed', function (done) {
    this.timeout(config.timeout);
    chai.request(server)
      .post('/api/v1/uploadContracts')
      .send({
        username: admin.name,
        address: admin.address,
        password: admin.password,
        chainId: chainID
      })
      .end((err, res) => {
        assert.equal(res.statusCode, 500, 'contracts are already deployed');
        done();
      });
  });

});
