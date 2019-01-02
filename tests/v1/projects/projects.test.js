require('co-mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../../server');
const ba = require('blockapps-rest');
const util = ba.common.util;
const common = ba.common;
const assert = ba.common.assert;
const config = common.config;
const rest = ba.rest6;

const ProjectState = ba.rest.getEnums(`${config.libPath}/project/contracts/ProjectState.sol`).ProjectState;
const ProjectEvent = ba.rest.getEnums(`${config.libPath}/project/contracts/ProjectEvent.sol`).ProjectEvent;

const dappJs = require('../../../server/dapp/dapp');
const poster = require('../../poster');
const jwtDecode = require('jwt-decode');
const utils = require('../../../server/utils');

chai.use(chaiHttp);

const userAccessToken1 = process.env.USER_ACCESS_TOKEN_1;
const userAccessToken2 = process.env.USER_ACCESS_TOKEN_2;

describe("Projects Test", function () {
  this.timeout(config.timeout);
  const uid = util.uid();
  const projectArgs = createProjectArgs(uid);
  const amount = 100;
  let bidId;

  let stratoUser1, stratoUser2, chainID, supplier, buyer;

  before(function* () {
    // decode and create new account
    const decodedToken = jwtDecode(userAccessToken1);
    const userEmail = decodedToken['email'];
    stratoUser1 = yield utils.createUser(userAccessToken1, userEmail);

    // decode and create new account
    const decodedToken1 = jwtDecode(userAccessToken2);
    const userEmail1 = decodedToken1['email'];
    stratoUser2 = yield utils.createUser(userAccessToken2, userEmail1);

    const chain = {
      label: `test airline ${util.uid()}`,
      src: 'contract Governance { }',
      args: {},
      members: [
        {
          address: stratoUser1.address,
          enode: "enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303?discport=30303"
        },
        {
          address: stratoUser2.address,
          enode: "enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303?discport=30303"
        }
      ],
      balances: [
        {
          address: stratoUser1.address,
          balance: 1000000000000000000000000
        },
        {
          address: stratoUser2.address,
          balance: 1000000000000000000000000
        }
      ]
    }

    chainID = yield rest.createChain(chain.label, chain.members, chain.balances, chain.src, chain.args);

    // NOTE: This will carry mockdata of chains and user
    config.deployFilename = `./tests/mock/chainsMock.deploy.yaml`;

    this.timeout(config.timeout);
    const dapp = yield dappJs.uploadContract(userAccessToken1, config.libPath, chainID);
    yield dapp.deploy(config.dataFilename, config.deployFilename, chainID);

    // Create local users
    supplier = yield dapp.createUser({ address: stratoUser1.address, role: 'SUPPLIER' }, chainID);
    buyer = yield dapp.createUser({ address: stratoUser2.address, role: 'BUYER' }, chainID);
  });

  it('should create a project', function* () {
    this.timeout(config.timeout);
    projectArgs.chainId = chainID;
    const url = '/projects';
    const response = yield poster.post(url, projectArgs, userAccessToken1);

    const project = response.project;
    assert.isDefined(project, 'should return new project');
    // todo: the created project returns the created project
    assert.equal(project.name, projectArgs.name, 'new project should contain name');
    assert.equal(project.buyer, projectArgs.buyer, 'new project should contain buyer');
    assert.equal(project.description, projectArgs.description, 'project desc should be same as in request');
    assert.equal(project.spec, projectArgs.spec, 'project spec should be same as in request');
  });

  it('should return a project by its name', function* () {
    this.timeout(config.timeout);

    const url = `/projects/${encodeURIComponent(projectArgs.name)}?chainId=${chainID}`;
    const response = yield poster.get(url, userAccessToken1);

    const project = response.project;
    assert.isDefined(project, 'should return project');
    assert.equal(project.name, projectArgs.name, 'project name should be same as in request');
    assert.equal(project.buyer, projectArgs.buyer, 'new project should contain buyer');
    assert.equal(project.description, projectArgs.description, 'project desc should be same as in request');
    assert.equal(project.spec, projectArgs.spec, 'project spec should be same as in request');
  });

  it('should return the list of projects filtered by buyer', function* () {
    this.timeout(config.timeout);

    const url = `/projects?chainId=${chainID}&buyer=${projectArgs.buyer}&filter=buyer`;
    const response = yield poster.get(url, userAccessToken1);

    const projects = response.projects;
    assert.isDefined(projects, 'should return projects');
    assert.isArray(projects, 'projects list should be an array');
  });

  it('should return the list of projects filtered by state', function* () {
    this.timeout(config.timeout);
    const state = ProjectState.OPEN;

    const url = `/projects?chainId=${chainID}&state=${state}&filter=state`;
    const response = yield poster.get(url, userAccessToken1);

    const projects = response.projects;
    assert.isDefined(projects, 'should return projects');
    assert.isArray(projects, 'projects list should be an array');
    assert.isOk(projects.length > 0, 'projects list should not be empty');
  });

  it('should return the list of projects filtered by supplier', function* () {
    this.timeout(config.timeout);

    const url = `/projects?chainId=${chainID}&supplier=${supplier.address}&filter=supplier`;
    const response = yield poster.get(url, userAccessToken1);

    const projects = response.projects;
    assert.isDefined(projects, 'should return projects');
    assert.isArray(projects, 'projects list should be an array');
  });

  it('Should bid on a project', function* () {
    this.timeout(config.timeout);

    const url = `/projects/${encodeURIComponent(projectArgs.name)}/bids`;
    const response = yield poster.post(url, { supplier: supplier.account, amount, chainId: chainID }, userAccessToken1);

    const bid = response.bid;
    assert.isDefined(bid, 'should return new bid');
    assert.equal(bid.supplier, supplier.account, 'new bid should contain supplier');
    assert.equal(bid.amount, amount, 'new bid should contain amount');
    bidId = bid.id; // save for the next tests
  });

  it('Should get bids for a project', function* () {
    this.timeout(config.timeout);

    const url = `/projects/${encodeURIComponent(projectArgs.name)}/bids?chainId=${chainID}`;
    const response = yield poster.get(url, userAccessToken1);

    const bids = response.bids;
    assert.isArray(bids, 'should be an array');
    assert.equal(bids.length, 1, 'length of bid array should be 1');
    const bid = bids[0];
    assert.isDefined(bid, 'should return new bid');
    assert.equal(bid.supplier, supplier.account, 'new bid should contain supplier');
    assert.equal(bid.amount, amount, 'new bid should contain amount');
  });

  it('Should accept bid', function* () {
    this.timeout(config.timeout);
    const body = {
      projectEvent: ProjectEvent.ACCEPT,
      bidId: bidId,
      chainId: chainID,
      account: buyer.account
    };

    const url = `/projects/${encodeURIComponent(projectArgs.name)}/events`;
    const response = yield poster.post(url, body, userAccessToken1);

    // this will check the updated state
    assert.equal(response.state, ProjectEvent.DELIVER, "should change the state to DELIVER")
  });

  it('should change project state to INTRANSIT', function* () {
    this.timeout(config.timeout);

    const body = {
      projectEvent: ProjectEvent.DELIVER,
      chainId: chainID,
      account: supplier.account
    };

    const url = `/projects/${encodeURIComponent(projectArgs.name)}/events`;
    const response = yield poster.post(url, body, userAccessToken1);

    assert.equal(response.state, ProjectState.INTRANSIT, 'returned state should be INTRANSIT');
  });

  // NOTE: in order to receive, a payment must be made.
  // to run properly, this test will requires the creation of users
  it.skip('should change project state to RECEIVED', function (done) {
    this.timeout(config.timeout);
    chai.request(server)
      .post('/api/v1/projects/' + projectArgs.name + '/events')
      .send({ projectEvent: ProjectEvent.RECEIVE })
      .end((err, res) => {
        const data = assert.apiData(err, res); // FIXME -LS return value
        assert.equal(data.bid.state, ProjectState.RECEIVED, 'returned state should be RECEIVED');
        done();
      });
  });
});


function createProjectArgs(uid) {
  const projectArgs = {
    name: 'Project_ ? ' + uid,
    buyer: 'Buyer1',
    description: 'description_ ? % ' + uid,
    spec: 'spec_ ? % ' + uid,
    price: 1234,

    created: new Date().getTime(),
    targetDelivery: new Date().getTime() + 3 * 24 * 60 * 60 * 1000, // 3 days
  };

  return projectArgs;
}
