const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;
const util = common.util;
const should = common.should;
const assert = common.assert;
const Promise = common.Promise;

const user = require('../user');
const userManager = require('../userManager');
const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;
const UserRole = rest.getEnums(`${config.libPath}/user/contracts/UserRole.sol`).UserRole;

const adminName = util.uid('Admin');
const adminPassword = '1234';

describe('UserManager tests', function() {
  this.timeout(config.timeout);

  const scope = {};

  // get ready:  admin-user and manager-contract
  before(function (done) {
    rest.setScope(scope)
      // create admin
      .then(rest.createUser(adminName, adminPassword))
      // upload UserManager
      .then(userManager.uploadContract(adminName, adminPassword))
      .then(function (scope) {
        done();
      }).catch(done);
  });

  it('Create User', function(done) {
    const username = util.uid('User');
    const pwHash = util.toBytes32('1234'); // FIXME this is not a hash
    const role = UserRole.SUPPLIER;

    rest.setScope(scope)
      // create user
      .then(userManager.createUser(adminName, username, pwHash, role))
      // returns the user from search
      .then(function(scope) {
        const resultArray = scope.query.slice(-1)[0];
        const result = resultArray[0];
        assert.equal(result.username, username, 'username');
        assert.equal(result.pwHash, pwHash, 'pwHash');
        assert.equal(result.role, UserRole[role], 'role');
        return scope;
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });

  it('Test exists()', function(done) {
    const username = util.uid('User');
    const pwHash = util.toBytes32('1234'); // FIXME this is not a hash
    const role = UserRole.SUPPLIER;

    rest.setScope(scope)
      // should not exists
      .then(userManager.exists(adminName, username))
      .then(function(scope) {
        const result = scope.result;
        assert.isDefined(result, 'should be defined');
        assert.isNotOk(result, 'should not exist');
        return scope;
      })
      // create user
      .then(userManager.createUser(adminName, username, pwHash, role))
      // should exist
      .then(userManager.exists(adminName, username))
      .then(function(scope) {
        const result = scope.result;
        assert.equal(result, true, 'should exist')
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });

  it('Create Duplicate User', function(done) {
    const username = util.uid('User');
    const pwHash = util.toBytes32('1234'); // FIXME this is not a hash
    const role = UserRole.SUPPLIER;

    scope.error = undefined;

    rest.setScope(scope)
      // create user
      .then(userManager.createUser(adminName, username, pwHash, role))
      .then(function(scope) {
        // create a duplicate - should FAIL
        return rest.setScope(scope)
          .then( userManager.createUser(adminName, username, pwHash, role))
          .then(function(scope) {
            // did not FAIL - that is an error
            scope.error = 'Duplicate username was not detected: ' + username;
            return scope
          })
          .catch(function(error) {
            const errorCode = error.message;
            // error should be EXISTS
            if (errorCode == ErrorCodes.EXISTS) {
              return scope;
            }
            // different error thrown - not good
            scope.error = 'userManager.createUser: threw:' + errorCode;
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

  it('Get User', function(done) {
    const username = util.uid('User');
    const pwHash = util.toBytes32('1234'); // FIXME this is not a hash
    const role = UserRole.SUPPLIER;

    rest.setScope(scope)
      // get user - should not exist
      .then(userManager.getUser(adminName, username))
      .then(function(scope) {
        const result = scope.result;
        assert.isUndefined(result, 'should not be found');
        return scope;
      })
      // create user
      .then(userManager.createUser(adminName, username, pwHash, role))
      // get user - should exist
      .then(userManager.getUser(adminName, username))
      .then(function(scope) {
        const result = scope.result;
        assert.equal(result.username, username, 'username should be found');
        return scope;
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });

  it('Get Users', function(done) {
    const username = util.uid('User');
    const pwHash = util.toBytes32('1234'); // FIXME this is not a hash
    const role = UserRole.SUPPLIER;

    rest.setScope(scope)
      // get users - should not exist
      .then(userManager.getUsers(adminName))
      .then(function(scope) {
        const users = scope.result;
        const found = users.filter(function(user) {
          return user.username === username;
        });
        assert.equal(found.length, 0, 'user list should NOT contain ' + username);
        return scope;
      })
      // create user
      .then(userManager.createUser(adminName, username, pwHash, role))
      // get user - should exist
      .then(userManager.getUsers(adminName))
      .then(function(scope) {
        const users = scope.result;
        const found = users.filter(function(user) {
          return user.username === username;
        });
        assert.equal(found.length, 1, 'user list should contain ' + username);
        return scope;
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });

  it('User Login', function(done) {
    const username = util.uid('User');
    const password = '1234';
    const pwHash = util.toBytes32(password); // FIXME this is not a hash
    const role = UserRole.SUPPLIER;

    rest.setScope(scope)
      // auth non-existing - should fail
      .then(userManager.login(adminName, username, password))
      .then(function(scope) {
        assert.isDefined(scope.result, 'auth result should be defined');
        assert.isNotOk(scope.result, 'auth should fail');
        return scope;
      })
      // create user
      .then(userManager.createUser(adminName, username, pwHash, role))
      // auth
      .then(userManager.login(adminName, username, password))
      .then(function(scope) {
        assert.isOk(scope.result, 'auth should be ok');
        return scope;
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });


});
