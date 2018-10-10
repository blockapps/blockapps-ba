require('co-mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../../server');
const ba = require('blockapps-rest');
const util = ba.common.util;
const common = ba.common;
const should = ba.common.should;
const assert = ba.common.assert;
const expect = ba.common.expect;
const config = common.config;
const rest = ba.rest;

const dappJs = require('../../../server/dapp/dapp');
const fs = require("fs");

chai.use(chaiHttp);

describe("Projects MultiChain Test", function () {
  this.timeout(config.timeout);

  const uid = util.uid();
  const amount = 100;

  const password = '1234';
  let admin, buyer, supplier;
  let admin1, buyer1, supplier1;
  let firstChainId, secoundChainId;
  let firstProjectArgs, secoundProjectArgs;

  before(function* () {
    admin = yield rest.createUser(`Admin_${uid}`, password);
    buyer = yield rest.createUser(`Supplier_${uid}`, password);
    supplier = yield rest.createUser(`Buyer_${uid}`, password);

    admin1 = yield rest.createUser(`Admin_${uid}`, password);
    buyer1 = yield rest.createUser(`Supplier_${uid}`, password);
    supplier1 = yield rest.createUser(`Buyer_${uid}`, password);

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
          address: buyer.address,
          enode: "enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303?discport=30303"
        },
        {
          address: supplier.address,
          enode: "enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303?discport=30303"
        }
      ],
      balances: [
        {
          address: admin.address,
          balance: 1000000000000000000000000
        },
        {
          address: buyer.address,
          balance: 1000000000000000000000000
        },
        {
          address: supplier.address,
          balance: 1000000000000000000000000
        }
      ]
    }

    const chain1 = {
      label: `test airline ${util.uid()}`,
      src: 'contract Governance { }',
      args: {},
      members: [
        {
          address: admin1.address,
          enode: "enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303?discport=30303"
        },
        {
          address: buyer1.address,
          enode: "enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303?discport=30303"
        },
        {
          address: supplier1.address,
          enode: "enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303?discport=30303"
        }
      ],
      balances: [
        {
          address: admin1.address,
          balance: 1000000000000000000000000
        },
        {
          address: buyer1.address,
          balance: 1000000000000000000000000
        },
        {
          address: supplier1.address,
          balance: 1000000000000000000000000
        }
      ]
    }

    firstChainId = yield rest.createChain(chain.label, chain.members, chain.balances, chain.src, chain.args);
    secoundChainId = yield rest.createChain(chain1.label, chain1.members, chain1.balances, chain1.src, chain1.args);

    config.deployFilename = `./tests/mock/chainsMock.deploy.yaml`;
    config.usersFilename = `./tests/mock/usersMock.deploy.yaml`;

    fs.appendFile(config.usersFilename, '', function (err) {
      if (err) throw err;
      console.log('Saved!');
    });

    const dapp = yield dappJs.uploadContract(admin, config.libPath, firstChainId);
    yield dapp.deploy(config.dataFilename, config.deployFilename, firstChainId);

    const dapp1 = yield dappJs.uploadContract(admin1, config.libPath, secoundChainId);
    yield dapp1.deploy(config.dataFilename, config.deployFilename, secoundChainId);
  });

  it('create user: should create new user (supplier)', function (done) {
    this.timeout(config.timeout);
    chai.request(server)
      .post('/api/v1/users/create')
      .send({ chainId: firstChainId, username: supplier.name, password: supplier.password, address: supplier.address, role: 'SUPPLIER' })
      .end((err, res) => {
        const data = assert.apiData(err, res);
        assert.equal(data, 'User created successfully', 'create user should contain message');
        done();
      });
  });

  it('create user: should create new user (buyer)', function (done) {
    this.timeout(config.timeout);
    chai.request(server)
      .post('/api/v1/users/create')
      .send({ chainId: firstChainId, username: buyer.name, password: buyer.password, address: buyer.address, role: 'BUYER' })
      .end((err, res) => {
        const data = assert.apiData(err, res);
        assert.equal(data, 'User created successfully', 'create user should contain message');
        done();
      });
  });

  it('create user: should create new user (supplier)', function (done) {
    this.timeout(config.timeout);
    chai.request(server)
      .post('/api/v1/users/create')
      .send({ chainId: secoundChainId, username: supplier1.name, password: supplier1.password, address: supplier1.address, role: 'SUPPLIER' })
      .end((err, res) => {
        const data = assert.apiData(err, res);
        assert.equal(data, 'User created successfully', 'create user should contain message');
        done();
      });
  });

  it('create user: should create new user (buyer)', function (done) {
    this.timeout(config.timeout);
    chai.request(server)
      .post('/api/v1/users/create')
      .send({ chainId: secoundChainId, username: buyer1.name, password: buyer1.password, address: buyer1.address, role: 'BUYER' })
      .end((err, res) => {
        const data = assert.apiData(err, res);
        assert.equal(data, 'User created successfully', 'create user should contain message');
        done();
      });
  });

  it('should create a project (on first chain)', function (done) {
    this.timeout(config.timeout);

    const uid = util.uid();
    firstProjectArgs = createProjectArgs(uid, firstChainId);

    chai.request(server)
      .post('/api/v1/projects')
      .send(firstProjectArgs)
      .end((err, res) => {
        const data = assert.apiData(err, res);
        const project = data.project;
        assert.isDefined(project, 'should return new project');
        // todo: the created project returns the created project
        assert.equal(project.name, firstProjectArgs.name, 'new project should contain name');
        assert.equal(project.buyer, firstProjectArgs.buyer, 'new project should contain buyer');
        assert.equal(project.description, firstProjectArgs.description, 'project desc should be same as in request');
        assert.equal(project.spec, firstProjectArgs.spec, 'project spec should be same as in request');
        done();
      });
  });

  it('should create a project (on secound chain)', function (done) {
    this.timeout(config.timeout);

    const uid = util.uid();
    secoundProjectArgs = createProjectArgs(uid, secoundChainId);

    chai.request(server)
      .post('/api/v1/projects')
      .send(secoundProjectArgs)
      .end((err, res) => {
        const data = assert.apiData(err, res);
        const project = data.project;
        assert.isDefined(project, 'should return new project');
        // todo: the created project returns the created project
        assert.equal(project.name, secoundProjectArgs.name, 'new project should contain name');
        assert.equal(project.buyer, secoundProjectArgs.buyer, 'new project should contain buyer');
        assert.equal(project.description, secoundProjectArgs.description, 'project desc should be same as in request');
        assert.equal(project.spec, secoundProjectArgs.spec, 'project spec should be same as in request');
        done();
      });
  });

  it('should check the projects are not same on multiple chain', async function () {
    this.timeout(config.timeout);

    let firstChainResponse = await chai.request(server)
      .get(`/api/v1/projects/${encodeURIComponent(firstProjectArgs.name)}/`)
      .query({ chainId: firstChainId })

    let secoundChainResponse = await chai.request(server)
      .get(`/api/v1/projects/${encodeURIComponent(secoundProjectArgs.name)}/`)
      .query({ chainId: secoundChainId })

    const firstChainData = firstChainResponse.body;
    const secoundChainData = secoundChainResponse.body;

    let firstChainProject = firstChainData.data.project;
    let secoundChainProject = secoundChainData.data.project;

    assert.isDefined(firstChainProject, 'should return project');
    assert.isDefined(secoundChainProject, 'should return project');

    assert.notEqual(firstChainProject.name, secoundChainProject.name);
    assert.notEqual(firstChainProject.chainId, secoundChainProject.chainId);
    assert.equal(firstChainProject.state, secoundChainProject.state);
  });

});

function createProjectArgs(uid, chainId) {
  const projectArgs = {
    name: 'Project_ ? ' + uid,
    buyer: 'Buyer1',
    description: 'description_ ? % ' + uid,
    spec: 'spec_ ? % ' + uid,
    price: 1234,
    created: new Date().getTime(),
    targetDelivery: new Date().getTime() + 3 * 24 * 60 * 60 * 1000, // 3 days
    chainId: chainId
  };

  return projectArgs;
}
