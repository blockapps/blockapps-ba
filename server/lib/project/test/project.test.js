const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;
const util = common.util;
const should = common.should;
const assert = common.assert;
const Promise = common.Promise;

const project = require('../project');

const adminName = util.uid('Admin');
const adminPassword = '1234';

describe('Project tests', function() {
  this.timeout(config.timeout);

  const scope = {};

  before(function (done) {
    rest.setScope(scope)
      .then(rest.createUser(adminName, adminPassword))
      .then(function (scope) {
        done();
      }).catch(done);
  });

  it('Create Contract', function(done) {
    const id = new Date().getTime();
    const buyer = 'Buyer1';

    const args = {
      _id: id,
      _buyer: buyer,
    };

    // create with constructor args
    rest.setScope(scope)
      .then(project.uploadContract(adminName, adminPassword, args))
      .then(project.getState())
      .then(function(scope) {
        const project = scope.result;
        assert.equal(project.buyer, buyer, 'buyer');
        assert.equal(project.id, id, 'id');
        return scope;
      })
      .then(rest.waitQuery(`Project?id=eq.${id}`, 1))
      .then(function(scope) {
        done();
      }).catch(done);
  });

});
