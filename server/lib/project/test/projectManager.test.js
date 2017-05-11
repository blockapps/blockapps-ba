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
    const id = new Date().getTime();
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

});
