require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;
const util = common.util;
const should = common.should;
const assert = common.assert;
const constants = common.constants;
const BigNumber = common.BigNumber;
const Promise = common.Promise;

const user = require('../user');
const userManager = require('../userManager');
const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;
const UserRole = rest.getEnums(`${config.libPath}/user/contracts/UserRole.sol`).UserRole;

const adminName = util.uid('Admin');
const adminPassword = '1234';

describe('UserManager tests', function() {
  this.timeout(config.timeout);

  var admin;
  var contract;

  // get ready:  admin-user and manager-contract
  before(function* () {
    admin = yield rest.createUser(adminName, adminPassword);
    contract = yield userManager.uploadContract(admin);
    contract.src = 'removed';
    // compile if needed
    const isCompiled = yield userManager.isCompiled();
    if (!isCompiled) {
      const result = yield userManager.compileSearch();
    }
  });

  it('Create User', function* () {
    const args = createUserArgs();
    const baUser = yield userManager.createUser(admin, contract, args);
    assert.equal(baUser.username, args.username, 'username');
    assert.equal(baUser.role, args.role, 'role');
  });

  it('Test exists()', function* () {
    const args = createUserArgs();

    var exists;
    // should not exist
    exists = yield userManager.exists(admin, contract, args.username);
    assert.isDefined(exists, 'should be defined');
    assert.isNotOk(exists, 'should not exist');
    // create user
    const user = yield userManager.createUser(admin, contract, args);
    // should exist
    exists = yield userManager.exists(admin, contract, args.username);
    assert.equal(exists, true, 'should exist')
  });

  it('Create Duplicate User', function* () {
    const args = createUserArgs();

    // create user
    const user = yield userManager.createUser(admin, contract, args);
    try {
      // create duplicate - should fail
      const duplicateUser = yield userManager.createUser(admin, contract, args);
      // did not FAIL - that is an error
      assert.isUndefined(duplicateUser, `Duplicate username was not detected: ${args.username}`);
    } catch(error) {
      // error should be EXISTS
      const errorCode = error.message;
      // if not - throw
      if (errorCode != ErrorCodes.EXISTS) {
        throw error;
      }
    }
  });

  it('Get User', function *() {
    const args = createUserArgs();

    // get non-existing user
    try {
      const baUser = yield userManager.getUser(admin, contract, args.username);
      // did not FAIL - that is an error
      assert.isUndefined(baUser, `User should not be found ${args.username}`);
    } catch(error) {
      // error should be NOT_FOUND
      const errorCode = error.message;
      // if not - throw
      if (errorCode != ErrorCodes.NOT_FOUND) {
        throw error;
      }
    }

    // create user
    yield userManager.createUser(admin, contract, args);
    // get user - should exist
    const baUser = yield userManager.getUser(admin, contract, args.username);
    assert.equal(baUser.username, args.username, 'username should be found');
  });

  it('Get Users', function* () {
    const args = createUserArgs();

    // get users - should not exist
    {
      const users = yield userManager.getUsers(admin, contract);
      const found = users.filter(function(user) {
        return user.username === args.username;
      });
      assert.equal(found.length, 0, 'user list should NOT contain ' + args.username);
    }
    // create user
    const user = yield userManager.createUser(admin, contract, args);
    // get user - should exist
    {
      const users = yield userManager.getUsers(admin, contract);
      const found = users.filter(function(user) {
        return user.username === args.username;
      });
      assert.equal(found.length, 1, 'user list should contain ' + args.username);
    }
  });

  it('User Login', function* () {
    const args = createUserArgs();

    // auth non-existing - should fail
    {
      const result = yield userManager.login(admin, contract, args);
      assert.isDefined(result, 'auth result should be defined');
      assert.isNotOk(result, 'auth should fail');
    }

    // create user
    const user = yield userManager.createUser(admin, contract, args);
    // auth
    {
      const result = yield userManager.login(admin, contract, args);
      assert.isOk(result, 'auth should be ok');
    }
  });

  it('Get account', function* () {
    const args = createUserArgs();
    // create user
    const user = yield userManager.createUser(admin, contract, args);
    // check account
    const account = (yield userManager.getAccount(user.account))[0];
    const balance = new BigNumber(account.balance);
    const faucetBalance = new BigNumber(1000).times(constants.ETHER);
    balance.should.be.bignumber.equal(faucetBalance);
  });

  it('Get balance', function* () {
    const args = createUserArgs();
    // create user
    const user = yield userManager.createUser(admin, contract, args);
    const balance = yield userManager.getBalance(admin, contract, user.username);
    const faucetBalance = new BigNumber(1000).times(constants.ETHER);
    balance.should.be.bignumber.equal(faucetBalance);
  });

  it('Send funds', function* () {
    // create buyer/seller
    const buyerArgs = createUserArgs('Buyer', UserRole.BUYER);
    const buyer = yield userManager.createUser(admin, contract, buyerArgs);
    buyer.startingBalance = yield userManager.getBalance(admin, contract, buyer.username);

    const supplierArgs = createUserArgs('Supplier', UserRole.SUPPLIER);
    const supplier = yield userManager.createUser(admin, contract, supplierArgs);
    supplier.startingBalance = yield userManager.getBalance(admin, contract, supplier.username);

    // TRANSACTION
    // function* send(fromUser, toUser, valueEther, nonce, node)
    const valueEther = 12;
    const receipt = yield rest.send(buyer.blocUser, supplier.blocUser, valueEther);
    const txResult = yield rest.transactionResult(receipt.hash);
    assert.equal(txResult[0].status, 'success');

    // check balances
    buyer.endBalance = yield userManager.getBalance(admin, contract, buyer.username);
    supplier.endBalance = yield userManager.getBalance(admin, contract, supplier.username);

    const delta = new BigNumber(valueEther).mul(constants.ETHER);
    assert.isOk(buyer.startingBalance.minus(delta).greaterThan(buyer.endBalance), "buyer's balance should be slightly less than expected due to gas costs");
    assert.isOk(supplier.startingBalance.plus(delta).equals(supplier.endBalance), "supplier's balance should be as expected after sending ether");
  });
});

// function createUser(address account, string username, bytes32 pwHash, UserRole role) returns (ErrorCodes) {
function createUserArgs(_name, _role) {
  const uid = util.uid();
  const role = _role || UserRole.SUPPLIER;
  const name = _name || 'User';
  const args = {
    username: name + uid,
    password: 'Pass' + uid,
    role: role,
  }
  return args;
}
