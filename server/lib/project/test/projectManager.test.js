const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;
const util = common.util;
const should = common.should;
const assert = common.assert;
const Promise = common.Promise;

const project = require('../project');
const projectManager = require('../projectManager');
const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;

const adminName = util.uid('Admin');
const adminPassword = '1234';

describe('ProjectManager tests', function() {
  this.timeout(config.timeout);

  const scope = {};

  // get ready:  admin-user and manager-contract
  before(function (done) {
    rest.setScope(scope)
      // create admin
      .then(rest.createUser(adminName, adminPassword))
      // upload UserManager
      .then(projectManager.uploadContract(adminName, adminPassword))
      .then(function (scope) {
        done();
      }).catch(done);
  });

  it('Create Project', function(done) {
    const id = fakeId();
    const buyer = 'Buyer1';

    rest.setScope(scope)
      // create user
      .then(projectManager.createProject(adminName, id, buyer))
      // returns the record from search
      .then(function(scope) {
        const project = scope.result;
        assert.equal(project.id, id, 'id');
        assert.equal(project.buyer, buyer, 'buyer');
        return scope;
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });

  it('Test exists()', function(done) {
    const id = fakeId();
    const buyer = 'Buyer1';

    rest.setScope(scope)
      // should not exists
      .then(projectManager.exists(adminName, id))
      .then(function(scope) {
        const exists = scope.result;
        assert.isDefined(exists, 'should be defined');
        assert.isNotOk(exists, 'should not exist');
        return scope;
      })
      // create user
      .then(projectManager.createProject(adminName, id, buyer))
      // should exist
      .then(projectManager.exists(adminName, id))
      .then(function(scope) {
        const exists = scope.result;
        assert.equal(exists, true, 'should exist')
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });


});

function fakeId() {
  return new Date().getTime();
}
