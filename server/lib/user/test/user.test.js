require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;
const util = common.util;
const should = common.should;
const assert = common.assert;
const Promise = common.Promise;

const userJs = require('../user');

const adminName = util.uid('Admin');
const adminPassword = '1234';

describe('User tests', function() {
  this.timeout(config.timeout);

  var admin;

  before(function*() {
    admin = yield rest.createUser(adminName, adminPassword);
    // compile if needed
    yield userJs.compileSearch(true);
  })

  it.only('Create Contract', function* () {
    const id = 123;
    const uid = util.uid();
    const email = `Email_${id}_${uid}`;
    const firstName = `First_${id}_${uid}`;
    const lastName = `Last_${id}_${uid}`;
    const pwHash = util.toBytes32('1234'); // FIXME this is not a hash
    const role = userJs.UserRole.SUPPLIER;

    // function User(address _account, string _username, bytes32 _pwHash, uint _id, UserRole _role) {
    const args = {
      _email: email,
      _firstName: firstName,
      _lastName: lastName,
      _pwHash: pwHash,
      _id: id,
      _role: role,
    };

    // create the user with constructor args
    const contract = yield userJs.uploadContract(admin, args);
    const user = yield userJs.getState(contract);
    assert.equal(user.email, email, 'email');
    assert.equal(user.firstName, firstName, 'firstName');
    assert.equal(user.lastName, lastName, 'lastName');
    assert.equal(util.fixBytes(user.pwHash), pwHash, 'pwHash');
    assert.equal(user.id, id, 'id');
    assert.equal(util.parseEnum(user.role), userJs.UserRole[role], 'role');
  });

  it('Search Contract', function* () {
    const id = new Date().getTime();
    const username = util.uid('User'+id);
    const pwHash = util.toBytes32('1234'); // FIXME this is not a hash
    const role = userJs.UserRole.SUPPLIER;
    const account = `3db01104b0c639556a3e1757f1ee1f7a1d3541d5`;

    // function User(address _account, string _username, bytes32 _pwHash, uint _id, UserRole _role) {
    const args = {
      _account: account,
      _username: username,
      _pwHash: pwHash,
      _id: id,
      _role: role,
    };

    // create the user with constructor args
    const contract = yield userJs.uploadContract(admin, args);
    // search
    const user = yield userJs.getUserById(id);

    assert.equal(user.account, account, 'account');
    assert.equal(user.username, username, 'username');
    assert.equal(user.pwHash, pwHash, 'pwHash');
    assert.equal(user.id, id, 'id');
    assert.equal(user.role, role, 'role');
  });

  it('Auth', function* () {
    const id = new Date().getTime();
    const username = util.uid('User'+id);
    const pwHash = util.toBytes32('1234'); // FIXME this is not a hash
    const role = userJs.UserRole.SUPPLIER;
    const account = `3db01104b0c639556a3e1757f1ee1f7a1d3541d5`;

    // function User(address _account, string _username, bytes32 _pwHash, uint _id, UserRole _role) {
    const args = {
      _account: account,
      _username: username,
      _pwHash: pwHash,
      _id: id,
      _role: role,
    };

    // create the user with constructor args
    var isAuthenticated;
    const contract = yield userJs.uploadContract(admin, args);
    isAuthenticated = yield userJs.authenticate(admin, contract, pwHash);
    assert.isOk(isAuthenticated, 'authenticated');
    isAuthenticated = yield userJs.authenticate(admin, contract, util.toBytes32('666'));
    assert.isNotOk(isAuthenticated, 'not authenticated');
 });

});
