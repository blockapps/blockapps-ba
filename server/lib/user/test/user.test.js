require('co-mocha');
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

  var admin;

  before(function*() {
    admin = yield rest.createUser(adminName, adminPassword);
    // compile if needed
    const isCompiled = yield user.isCompiled();
    if (!isCompiled) {
      const result = yield user.compileSearch();
    }
  })

  it('Create Contract', function* () {
    const id = 123;
    const username = util.uid('User'+id);
    const pwHash = util.toBytes32('1234'); // FIXME this is not a hash
    const role = user.UserRole.SUPPLIER;
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
    const contract = yield user.uploadContract(admin, args);
    const myuser = yield user.getState(contract);
    assert.equal(myuser.account, account, 'account');
    assert.equal(myuser.username, username, 'username');
    assert.equal(util.fixBytes(myuser.pwHash), pwHash, 'pwHash');
    assert.equal(myuser.id, id, 'id');
    assert.equal(util.parseEnum(myuser.role), user.UserRole[role], 'role');
  });

  it('Search Contract', function* () {
    const id = new Date().getTime();
    const username = util.uid('User'+id);
    const pwHash = util.toBytes32('1234'); // FIXME this is not a hash
    const role = user.UserRole.SUPPLIER;
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
    const contract = yield user.uploadContract(admin, args);
    // search
    const queryResults = yield rest.waitQuery(`${user.contractName}?id=eq.${id}`, 1);
    const myuser = queryResults[0];

    assert.equal(myuser.account, account, 'account');
    assert.equal(myuser.username, username, 'username');
    assert.equal(myuser.pwHash, pwHash, 'pwHash');
    assert.equal(myuser.id, id, 'id');
    assert.equal(myuser.role, role, 'role');
  });

  it('Auth', function* () {
    const id = new Date().getTime();
    const username = util.uid('User'+id);
    const pwHash = util.toBytes32('1234'); // FIXME this is not a hash
    const role = user.UserRole.SUPPLIER;
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
    const contract = yield user.uploadContract(admin, args);
    isAuthenticated = yield user.authenticate(admin, contract, pwHash);
    assert.isOk(isAuthenticated, 'authenticated');
    isAuthenticated = yield user.authenticate(admin, contract, util.toBytes32('666'));
    assert.isNotOk(isAuthenticated, 'not authenticated');
 });

});
