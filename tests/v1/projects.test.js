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
const ProjectState = ba.rest.getEnums(`${config.libPath}/project/contracts/ProjectState.sol`).ProjectState;

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

describe("Projects Test", function() {
  const name = "Project_" + new Date().getTime();
  const buyer = "Buyer1";
  const supplier = "Supplier1";
  // const roleSupplier = UserRole.SUPPLIER;
  // const roleBuyer = UserRole.BUYER;

  it('should create a project', function(done) {
    this.timeout(config.timeout);
    chai.request(server)
      .post('/api/v1/projects')
      .send({
        name: name,
        buyer: buyer
      })
      .end((err, res) => {
        assert_noerr(err);
        assert_apiSuccess(res);
        res.body.should.have.property('data');
        const data = res.body.data;
        const project = data.project;
        assert.isDefined(project, 'should return new project');
        // todo: the created project returns the created project
        assert.equal(project.buyer, buyer, 'new project should contain buyer');
        done();
      });
  });

  it('should output the list of projects filtered by buyer', function(done) {
    this.timeout(config.timeout);
    const buyer = "Buyer1";
    chai.request(server)
      .get('/api/v1/projects')
      .query(
        {
          filter: 'buyer',
          buyer: buyer,
        }
      )
      .end((err, res) => {
        assert_noerr(err);
        assert_apiSuccess(res);
        res.body.should.have.property('data');
        const data = res.body.data;
        const projects = data.projects;
        assert.isDefined(projects, 'should return projects');
        assert.isArray(projects, 'projects list should be an array');
        //todo: the returned list should be filtered by buyer (preliminarily create at least one project)
        done();
      });
  });

  it('should output the list of projects filtered by state', function(done) {
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
        assert_noerr(err);
        assert_apiSuccess(res);
        res.body.should.have.property('data');
        const data = res.body.data;
        const projects = data.projects;
        assert.isDefined(projects, 'should return projects');
        assert.isArray(projects, 'projects list should be an array');
        //todo: the returned list should be filtered by state (preliminarily create at least one project)
        done();
      });
  });

  it('Should bid on a project', function(done){
    const amount = 100;
    this.timeout(config.timeout);
    chai.request(server)
      .post('/api/v1/projects/' + name + '/bid')
      .send({ supplier, amount })
      .end((err, res) => {
        assert_noerr(err);
        assert_apiSuccess(res);
        res.body.should.have.property('data');
        const data = res.body.data;
        const bid = data.bid;
        assert.isDefined(bid, 'should return new bid');
        assert.equal(bid.supplier, supplier, 'new bid should contain supplier');
        assert.equal(bid.amount, amount, 'new bid should contain amount');
        done();
      });
  });

});
