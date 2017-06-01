const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;
const util = common.util;
const should = common.should;
const assert = common.assert;
const Promise = common.Promise;

const user = require('../user');

const adminName = util.uid('Admin');
const adminPassword = '1234';

describe('User tests', function() {
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
    const id = 123;
    const username = util.uid('User'+id);
    const pwHash = util.toBytes32('1234'); // FIXME this is not a hash
    const role = user.UserRole.SUPPLIER;
    const account = `3db01104b0c639556a3e1757f1ee1f7a1d3541d5`;

    const args = {
      _account: account,
      _username: username,
      _pwHash: pwHash,
      _id: id,
      _role: role,
    };

    // create the user with constructor args
    rest.setScope(scope)
      .then(user.uploadContract(adminName, adminPassword, args))
      .then(user.getState())
      .then(function(scope) {
        const result = scope.result;

        assert.equal(result.account, account, 'account');
        assert.equal(result.username, username, 'username');
        assert.equal(util.fixBytes(result.pwHash), pwHash, 'pwHash');
        assert.equal(result.id, id, 'id');
//        assert.equal(result.role, role, 'role');

        return scope;
      })
      .then(rest.waitQuery(`User?username=eq.${username}`, 1))
      .then(function(scope) {
        console.log(scope.query.slice(-1)[0]);
        done();
      }).catch(done);
  });

  it('Auth', function(done) {
    const id = 123;
    const username = util.uid('User'+id);
    const pwHash = util.toBytes32('1234'); // FIXME this is not a hash
    const role = user.UserRole.SUPPLIER;
    const account = `3db01104b0c639556a3e1757f1ee1f7a1d3541d5`;

    const args = {
      _account: account,
      _username: username,
      _pwHash: pwHash,
      _id: id,
      _role: role,
    };

    // create the user with constructor args
    rest.setScope(scope)
      .then(user.uploadContract(adminName, adminPassword, args))
      .then(user.authenticate(adminName, pwHash))
      .then(function(scope) {
        const result = scope.result;
        assert.isOk(result, 'authenticated');
        return scope;
      })
      .then(user.authenticate(adminName, util.toBytes32('666')))
      .then(function(scope) {
        const result = scope.result;
        assert.isNotOk(result, 'not authenticated');
        return scope;
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });

});
