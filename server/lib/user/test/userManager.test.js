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

    rest.setScope(scope)
      // create user
      .then(userManager.createUser(adminName, username, pwHash))
      // query the contracts existence
      .then(rest.waitQuery(`${user.contractName}?username=eq.${username}`, 1))
      .then(function(scope) {
        const resultArray = scope.query.slice(-1)[0];
        const result = resultArray[0];
        console.log(result);

        assert.equal(result.username, username, 'username');
        assert.equal(result.pwHash, pwHash, 'pwHash');
        return scope;
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });

  it('Test exists()', function(done) {
    const username = util.uid('User');
    const pwHash = util.toBytes32('1234'); // FIXME this is not a hash

    rest.setScope(scope)
      // should not exists
      .then(userManager.exists(adminName, username))
      .then(function(scope) {
        const result = scope.result;
        assert.equal(result, false, 'should not exist');
        return scope;
      })
      // create user
      .then(userManager.createUser(adminName, username, pwHash))
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

    scope.error = undefined;

    rest.setScope(scope)
      // create user
      .then(userManager.createUser(adminName, username, pwHash))
      .then(function(scope) {
        // create a duplicate - should FAIL
        return rest.setScope(scope)
          .then( userManager.createUser(adminName, username, pwHash))
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
            console.log('-------------------- different error - not good');
            scope.error = errorCode;
            return scope
          });
      })
      .then(function(scope) {
        // check error for the previous step
        if (scope.error !== undefined)
          throw(new Error('userManager.createUser: threw: ' + scope.error));
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

    rest.setScope(scope)
      // get user - should not exist
      .then(userManager.getUser(adminName, username))
      .then(function(scope) {
        const result = scope.result;
        assert.equal(result, 0, 'should not be found');
        return scope;
      })
      // create user
      .then(userManager.createUser(adminName, username, pwHash))
      // get user - should exist
      .then(userManager.getUser(adminName, username))
      .then(function(scope) {
        const result = scope.result;
        assert.notEqual(result, 0, 'address should be found');
        return scope;
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });
  
  it('Get User', function(done) {
    const username = util.uid('User');
    const pwHash = util.toBytes32('1234'); // FIXME this is not a hash

    rest.setScope(scope)
      // get user - should not exist
      .then(userManager.getUser(adminName, username))
      .then(function(scope) {
        const result = scope.result;
        assert.equal(result, 0, 'should not be found');
        return scope;
      })
      // create user
      .then(userManager.createUser(adminName, username, pwHash))
      // get user - should exist
      .then(userManager.getUser(adminName, username))
      .then(function(scope) {
        const result = scope.result;
        assert.notEqual(result, 0, 'address should be found');
        return scope;
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });

});



// FIXME move to rest
function MethodError(contract, method, result) { // FIXME move to rest
  return new Error('Call to ' + contract + '.' + method + '() returned ' + result);
}
