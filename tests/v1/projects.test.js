const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const ba = require('blockapps-rest');
const common = ba.common;
const should = ba.common.should;
const assert = ba.common.assert;
const expect = ba.common.expect;
const config = common.config;

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

});
