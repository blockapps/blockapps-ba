require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const api = common.api;
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

  let admin;

  before(function*() {
    admin = yield rest.createUser(adminName, adminPassword);
  });

  it('Create Contract', function* () {
    const id = 123;
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
    const user = yield contract.getState();
    assert.equal(user.account, account, 'account');
    assert.equal(user.username, username, 'username');
    assert.equal(user.pwHash, pwHash, 'pwHash');
    assert.equal(user.id, id, 'id');
    assert.equal(user.role, role, 'role');
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
    let isAuthenticated;
    const contract = yield userJs.uploadContract(admin, args);
    isAuthenticated = yield contract.authenticate(pwHash);
    assert.isOk(isAuthenticated, 'authenticated');
    isAuthenticated = yield contract.authenticate(util.toBytes32('666'));
    assert.isNotOk(isAuthenticated, 'not authenticated');
 });

});
