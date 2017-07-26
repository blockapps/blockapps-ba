const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const ba = require('blockapps-rest');
const util = ba.common.util;
const common = ba.common;
const should = ba.common.should;
const assert = ba.common.assert;
const expect = ba.common.expect;
const config = common.config;
const UserRole = ba.rest.getEnums(`${config.libPath}/user/contracts/UserRole.sol`).UserRole;
const ProjectState = ba.rest.getEnums(`${config.libPath}/project/contracts/ProjectState.sol`).ProjectState;
const BidState = ba.rest.getEnums(`${config.libPath}/bid/contracts/BidState.sol`).BidState;
const ProjectEvent = ba.rest.getEnums(`${config.libPath}/project/contracts/ProjectEvent.sol`).ProjectEvent;

chai.use(chaiHttp);

describe("Projects Test", function() {
  const uid = util.uid();
  const projectArgs = createProjectArgs(uid);
  const supplier = "Supplier1";
  const amount = 100;
  let bidId;

  it('should create a project', function(done) {
    this.timeout(config.timeout);
    chai.request(server)
      .post('/api/v1/projects')
      .send(projectArgs)
      .end((err, res) => {
        const data = assert.apiData(err, res);
        const project = data.project;
        assert.isDefined(project, 'should return new project');
        // todo: the created project returns the created project
        assert.equal(project.name, projectArgs.name, 'new project should contain name');
        assert.equal(project.buyer, projectArgs.buyer, 'new project should contain buyer');
        assert.equal(project.description, projectArgs.description, 'project desc should be same as in request');
        assert.equal(project.spec, projectArgs.spec, 'project spec should be same as in request');
        done();
      });
  });

  it('should return a project by its name', function(done) {
    this.timeout(config.timeout);
    chai.request(server)
      .get(`/api/v1/projects/${encodeURIComponent(projectArgs.name)}/`)
      .end((err, res) => {
        const data = assert.apiData(err, res);
        const project = data.project;
        assert.isDefined(project, 'should return project');
        assert.equal(project.name, projectArgs.name, 'project name should be same as in request');
        assert.equal(project.buyer, projectArgs.buyer, 'new project should contain buyer');
        assert.equal(project.description, projectArgs.description, 'project desc should be same as in request');
        assert.equal(project.spec, projectArgs.spec, 'project spec should be same as in request');
        done();
      });
  });

  it('should return the list of projects filtered by buyer', function(done) {
    this.timeout(config.timeout);

    chai.request(server)
      .get('/api/v1/projects')
      .query(
        {
          filter: 'buyer',
          buyer: projectArgs.buyer,
        }
      )
      .end((err, res) => {
        const data = assert.apiData(err, res);
        const projects = data.projects;
        assert.isDefined(projects, 'should return projects');
        assert.isArray(projects, 'projects list should be an array');
        //todo: the returned list should be filtered by buyer (preliminarily create at least one project)
        done();
      });
  });

  it('should return the list of projects filtered by state', function(done) {
    this.timeout(config.timeout);
    const state = ProjectState.OPEN;
    chai.request(server)
      .get('/api/v1/projects')
      .query(
        {
          filter: 'state',
          state: state,
        }
      )
      .end((err, res) => {
        const data = assert.apiData(err, res);
        const projects = data.projects;
        assert.isDefined(projects, 'should return projects');
        assert.isArray(projects, 'projects list should be an array');
        assert.isOk(projects.length > 0, 'projects list should not be empty');
        //todo: the returned list should be filtered by state (preliminarily create at least one project for buyer)
        done();
      });
  });

  it('should return the list of projects filtered by supplier', function(done) {
    this.timeout(config.timeout);
    const supplier = "Supplier1";
    chai.request(server)
      .get('/api/v1/projects')
      .query(
        {
          filter: 'supplier',
          supplier: supplier,
        }
      )
      .end((err, res) => {
        assert.apiSuccess(res);
        res.body.should.have.property('data');
        const data = res.body.data;
        const projects = data.projects;
        assert.isDefined(projects, 'should return projects');
        assert.isArray(projects, 'projects list should be an array');
        //todo: the returned list should be filtered by supplier (preliminarily create at least one project for supplier)
        done();
      });
  });

  it('Should bid on a project', function(done){
    this.timeout(config.timeout);
    chai.request(server)
      .post(`/api/v1/projects/${encodeURIComponent(projectArgs.name)}/bids`)
      .send({ supplier, amount })
      .end((err, res) => {
        const data = assert.apiData(err, res);
        const bid = data.bid;
        assert.isDefined(bid, 'should return new bid');
        assert.equal(bid.supplier, supplier, 'new bid should contain supplier');
        assert.equal(bid.amount, amount, 'new bid should contain amount');
        bidId = bid.id; // save for the next tests
        done();
      });
  });

  it('Should get bids for a project', function(done){
    this.timeout(config.timeout);
    chai.request(server)
      .get(`/api/v1/projects/${encodeURIComponent(projectArgs.name)}/bids`)
      .end((err, res) => {
        const data = assert.apiData(err, res);
        const bids = data.bids;
        assert.isArray(bids, 'should be an array');
        assert.equal(bids.length, 1, 'length of bid array should be 1');
        const bid = bids[0];
        assert.isDefined(bid, 'should return new bid');
        assert.equal(bid.supplier, supplier, 'new bid should contain supplier');
        assert.equal(bid.amount, amount, 'new bid should contain amount');
        done();
      });
    });

  it('Should accept bid', function(done){
    this.timeout(config.timeout);
    chai.request(server)
      .post(`/api/v1/projects/${encodeURIComponent(projectArgs.name)}/events/`)
      .send({
        projectEvent: ProjectEvent.ACCEPT,
        username: projectArgs.buyer,
        bidId: bidId,
      })
      .end((err, res) => {
        assert.apiSuccess(res);
        res.body.should.have.property('data');
        // todo: body data should be empty
        // todo: check the project changed state to PRODUCTION
        done();
      });
  });

  it('should change project state to INTRANSIT', function(done) {
    this.timeout(config.timeout);
    chai.request(server)
      .post(`/api/v1/projects/${encodeURIComponent(projectArgs.name)}/events/`)
      .send({
        projectEvent: ProjectEvent.DELIVER,
        username: supplier,
      })
      .end((err, res) => {
        const data = assert.apiData(err, res); // FIXME -LS return value
        assert.equal(data.state, ProjectState.INTRANSIT, 'returned state should be INTRANSIT');
        done();
      });
  });

  // NOTE: in order to receive, a payment must be made.
  // to run properly, this test will requires the creation of users
  it.skip('should change project state to RECEIVED', function(done) {
    this.timeout(config.timeout);
    chai.request(server)
      .post('/api/v1/projects/' + projectArgs.name + '/events')
      .send({projectEvent: ProjectEvent.RECEIVE})
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
    targetDelivery: new Date().getTime() + 3 * 24*60*60*1000, // 3 days
  };

  return projectArgs;
}
