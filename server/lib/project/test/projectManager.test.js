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

  it('Create Duplicate Project', function(done) {
    const id = fakeId();
    const buyer = 'Buyer1';

    scope.error = undefined;

    rest.setScope(scope)
      // create project
      .then(projectManager.createProject(adminName, id, buyer))
      .then(function(scope) {
        // create a duplicate - should FAIL
        return rest.setScope(scope)
          .then(projectManager.createProject(adminName, id, buyer))
          .then(function(scope) {
            // did not FAIL - that is an error
            scope.error = 'Duplicate project-id was not detected: ' + id;
            return scope
          })
          .catch(function(error) {
            const errorCode = error.message;
            // error should be EXISTS
            if (errorCode == ErrorCodes.EXISTS) {
              return scope;
            }
            // different error thrown - not good
            scope.error = 'projectManager.createProject: threw: ' + errorCode;
            return scope
          });
      })
      .then(function(scope) {
        // check error for the previous step
        if (scope.error !== undefined)
          throw(new Error(scope.error));
        // all good
        return scope;
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });

  it('Get Project', function(done) {
    const id = fakeId();
    const buyer = 'Buyer1';

    rest.setScope(scope)
      // get project - should not exist
      .then(projectManager.getProject(adminName, id))
      .then(function(scope) {
        const project = scope.result;
        assert.isUndefined(project, 'should not be found');
        return scope;
      })
      // create project
      .then(projectManager.createProject(adminName, id, buyer))
      // get it - should exist
      .then(projectManager.getProject(adminName, id))
      .then(function(scope) {
        const project = scope.result;
        assert.equal(project.id, id, 'id should be found');
        return scope;
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });

  it('Get Projects', function(done) {
    const id = fakeId();
    const buyer = 'Buyer1';

    rest.setScope(scope)
      // get projects - should not exist
      .then(projectManager.getProjects(adminName))
      .then(function(scope) {
        const projects = scope.result;
        const found = projects.filter(function(project) {
          return project.id === id;
        });
        assert.equal(found.length, 0, 'project list should NOT contain ' + id);
        return scope;
      })
      // create project
      .then(projectManager.createProject(adminName, id, buyer))
      // get projects - should exist
      .then(projectManager.getProjects(adminName))
      .then(function(scope) {
        const projects = scope.result;
        const found = projects.filter(function(project) {
          return project.id === id;
        });
        assert.equal(found.length, 1, 'project list should contain ' + id);
        return scope;
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });

});

function fakeId() {
  const nano = process.hrtime()[1];
  return nano;
}
