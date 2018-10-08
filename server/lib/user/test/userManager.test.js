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

const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;
const UserRole = rest.getEnums(`${config.libPath}/user/contracts/UserRole.sol`).UserRole;

const adminName = util.uid('Admin');
const adminPassword = '1234';
const userManagerJs = require('../userManager');

describe('UserManager tests', function () {
  this.timeout(config.timeout);

  let admin, buyer, supplier;
  let buyerArgs, supplierArgs;
  let contract;

  // get ready:  admin-user and manager-contract
  before(function* () {
    admin = yield rest.createUser(adminName, adminPassword);

    buyerArgs = createUserArgs('Buyer', UserRole.BUYER);
    buyer = yield rest.createUser(buyerArgs.username, buyerArgs.password);

    supplierArgs = createUserArgs('Supplier', UserRole.SUPPLIER);
    supplier = yield rest.createUser(supplierArgs.username, supplierArgs.password);

    const chain = {
      label: 'test airline',
      src: 'contract Governance { }',
      args: {},
      members: [
        {
          address: admin.address,
          enode: "enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303?discport=30303"
        },
        {
          address: buyer.address,
          enode: "enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303?discport=30303"
        },
        {
          address: supplier.address,
          enode: "enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303?discport=30303"
        }
      ],
      balances: [
        {
          address: admin.address,
          balance: 1000000000000000000000
        },
        {
          address: buyer.address,
          balance: 1000000000000000000000
        },
        {
          address: supplier.address,
          balance: 1000000000000000000000
        }
      ]
    }

    chainID = yield rest.createChain(chain.label, chain.members, chain.balances, chain.src, chain.args);

    contract = yield userManagerJs.uploadContract(admin, {}, chainID);
  });

  it('Create User', function* () {
    const args = createUserArgs();
    const address = 'fe7880e5ca54f5abef32fb600a6bd2fda6b66ce8';
    const user = yield contract.createUser(args, chainID, address);
    assert.equal(user.username, args.username, 'username');
    assert.equal(user.role, args.role, 'role');
  });

  it('Create User - illegal name', function* () {
    const args = createUserArgs();
    const address = 'fe7880e5ca54f5abef32fb600a6bd2fda6b66ce8';
    args.username = '123456789012345678901234567890123'
    let user;
    try {
      // create with illegal name - should fail
      user = yield contract.createUser(args, chainID, address);
    } catch (error) {
      // error should be ERROR
      const errorCode = error.message;
      assert.equal(errorCode, ErrorCodes.ERROR, `Unexpected error ${JSON.stringify(error, null, 2)}`);
    }
    // did not FAIL - that is an error
    assert.isUndefined(user, `Illegal username was not detected: ${args.username}`);
  });

  it('Test exists()', function* () {
    const args = createUserArgs();
    const address = 'fe7880e5ca54f5abef32fb600a6bd2fda6b66ce8';

    let exists;
    // should not exist
    exists = yield contract.exists(args.username, chainID);
    assert.isDefined(exists, 'should be defined');
    assert.isNotOk(exists, 'should not exist');
    // create user
    const user = yield contract.createUser(args, chainID, address);
    // should exist
    exists = yield contract.exists(args.username, chainID);
    assert.equal(exists, true, 'should exist')
  });

  it('Test exists() with special characters', function* () {
    const args = createUserArgs();
    args.username += ' ?#%!@*';
    const address = 'fe7880e5ca54f5abef32fb600a6bd2fda6b66ce8';

    let exists;
    // should not exist
    exists = yield contract.exists(args.username, chainID);
    assert.isDefined(exists, 'should be defined');
    assert.isNotOk(exists, 'should not exist');
    // create user
    const user = yield contract.createUser(args, chainID, address);
    // should exist
    exists = yield contract.exists(args.username, chainID);
    assert.equal(exists, true, 'should exist')
  });

  it('Get User', function* () {
    const args = createUserArgs();
    const address = 'fe7880e5ca54f5abef32fb600a6bd2fda6b66ce8';

    // get non-existing user
    let nonExisting;
    try {
      nonExisting = yield contract.getUser(args.username, chainID);
    } catch (error) {
      // error should be NOT_FOUND
      const errorCode = error.message;
      assert.equal(errorCode, ErrorCodes.NOT_FOUND, 'should throw ErrorCodes.NOT_FOUND');
    }
    // did not FAIL - that is an error
    assert.isUndefined(nonExisting, `User should not be defined ${args.username}`);

    // create user
    yield contract.createUser(args, chainID, address);
    // get user - should exist
    const user = yield contract.getUser(args.username, chainID);
    assert.equal(user.username, args.username, 'username should be found');
  });

  it('Get Users', function* () {
    const args = createUserArgs();
    const address = 'fe7880e5ca54f5abef32fb600a6bd2fda6b66ce8';

    // get users - should not exist
    {
      const users = yield contract.getUsers();
      const found = users.filter(function (user) {
        return user.username === args.username;
      });
      assert.equal(found.length, 0, 'user list should NOT contain ' + args.username);
    }
    // create user
    const user = yield contract.createUser(args, chainID, address);
    // get user - should exist
    {
      const users = yield contract.getUsers(chainID);
      const found = users.filter(function (user) {
        return user.username === args.username;
      });
      assert.equal(found.length, 1, 'user list should contain ' + args.username);
    }
  });

  it.skip('User address leading zeros - load test - skipped', function* () {
    this.timeout(60 * 60 * 1000);

    const count = 16 * 4; // leading 0 once every 16
    const users = [];
    // create users
    for (let i = 0; i < count; i++) {
      const name = `User_${i}_`;
      const args = createUserArgs(name);
      const user = yield contract.createUser(args);
      users.push(user);
    }

    // get single user
    for (let user of users) {
      const resultUser = yield contract.getUser(user.username);
    }

    // get all users
    const resultUsers = yield contract.getUsers(admin, contract);
    const comparator = function (a, b) { return a.username == b.username; };
    const notFound = util.filter.isContained(users, resultUsers, comparator, true);
    assert.equal(notFound.length, 0, JSON.stringify(notFound));
  });


  it('User Login', function* () {
    const args = createUserArgs();
    const address = 'fe7880e5ca54f5abef32fb600a6bd2fda6b66ce8';

    // auth non-existing - should fail
    {
      const result = yield contract.login(args, chainID);
      assert.isDefined(result, 'auth result should be defined');
      assert.isNotOk(result, 'auth should fail');
    }

    // create user
    const user = yield contract.createUser(args, chainID, address);
    // auth
    {
      const result = yield contract.login(args, chainID);
      assert.isOk(result, 'auth should be ok');
    }
  });

  it('Get account', function* () {
    const args = createUserArgs();
    // create bloc user
    const blocUser = yield rest.createUser(args.username, args.password);
    // create user
    const user = yield contract.createUser(args, chainID, blocUser.address);
    // check account
    const account = (yield rest.getAccount(user.account))[0];
    assert.equal(account.address, blocUser.address, 'address');
  });

  it('Get balance', function* () {
    const args = createUserArgs();
    // create user
    const account = yield rest.createUser(args.username, args.password);
    const user = yield contract.createUser(args, chainID, account.address);
    const balance = yield contract.getBalance(user.username, chainID);
    const faucetBalance = new BigNumber(1000).times(constants.ETHER);
    balance.should.be.bignumber.equal(faucetBalance);
  });

  it('Send funds wei', function* () {
    const buyerAccount = yield contract.createUser(buyerArgs, chainID, buyer.address);
    buyerAccount.startingBalance = yield contract.getBalance(buyerAccount.username, chainID);
    buyerAccount.name = buyerAccount.username;

    supplierAccount = yield contract.createUser(supplierArgs, chainID, supplier.address);
    supplierAccount.startingBalance = yield contract.getBalance(supplierAccount.username, chainID);

    // TRANSACTION
    // function* send(fromUser, toUser, value, nonce, node)
    const value = new BigNumber(12).mul(constants.ETHER);
    const receipt = yield rest.send({ name: buyerAccount.username, address: buyerAccount.account, password: buyerAccount.password }, { address: supplierAccount.account }, value);
    const txResult = yield rest.transactionResult(receipt.hash, chainID);
    assert.equal(txResult[0].status, 'success');

    // check balances
    buyerAccount.endBalance = yield contract.getBalance(buyerAccount.username, chainID);
    supplierAccount.endBalance = yield contract.getBalance(supplierAccount.username, chainID);
    // buyer end balance = start - value - fee
    buyerAccount.startingBalance.minus(value).should.be.bignumber.gt(buyerAccount.endBalance);
    // supplier end balance = start + value
    supplierAccount.startingBalance.plus(value).should.be.bignumber.eq(supplierAccount.endBalance);
  });
});

// function createUser(address account, string username, bytes32 pwHash, UserRole role) returns (ErrorCodes) {
function createUserArgs(_name, _role) {
  const uid = util.uid();
  const role = _role || UserRole.SUPPLIER;
  const name = _name || 'User_';
  const args = {
    username: name + uid,
    password: 'Pass_' + uid,
    role: role,
  }
  return args;
}
