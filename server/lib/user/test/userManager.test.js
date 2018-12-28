require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest6;
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
const jwtDecode = require('jwt-decode');
const utils = require('../../../utils');

const accessToken = process.env.ADMIN_TOKEN;
const token2 = process.env.ADMIN_TOKEN1;
const userManagerJs = require('../userManager');

describe('UserManager tests', function () {
  this.timeout(config.timeout);

  let admin, stratoUser1, stratoUser2;
  let contract;

  // get ready:  admin-user and manager-contract
  before(function* () {
    this.timeout(config.timeout);
    // decode and create new account
    const decodedToken = jwtDecode(accessToken);
    const userEmail = decodedToken['email'];
    stratoUser1 = yield utils.createUser(accessToken, userEmail);

    // decode and create new account
    const decodedToken1 = jwtDecode(token2);
    const userEmail1 = decodedToken1['email'];
    stratoUser2 = yield utils.createUser(token2, userEmail1);

    const chain = {
      label: 'test airline',
      src: 'contract Governance { }',
      args: {},
      members: [
        {
          address: stratoUser1.address,
          enode: "enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303?discport=30303"
        },
        {
          address: stratoUser2.address,
          enode: "enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303?discport=30303"
        }
      ],
      balances: [
        {
          address: stratoUser1.address,
          balance: 100000000000000000000000000000000000
        },
        {
          address: stratoUser2.address,
          balance: 100000000000000000000000000000000000
        }
      ]
    }

    chainID = yield rest.createChain(chain.label, chain.members, chain.balances, chain.src, chain.args);
    contract = yield userManagerJs.uploadContract(accessToken, {}, chainID);
  });

  it('Create User', function* () {
    const args = createUserArgs(stratoUser1.address);
    const user = yield contract.createUser(args, chainID);
    assert.equal(user.account, args.account, 'account');
    assert.equal(user.role, args.role, 'role');
  });

  it('Test exists()', function* () {
    const args = createUserArgs(stratoUser1.address);

    let exists;
    // should exist
    exists = yield contract.exists(args.account, chainID);
    assert.equal(exists, true, 'should exist')
  });

  it('Get User', function* () {
    const args = createUserArgs(stratoUser1.address);
    const address = 'fe7880e5ca54f5abef32fb600a6bd2fda6b66ce';

    // get non-existing user
    let nonExisting;
    try {
      nonExisting = yield contract.getUser(address, chainID);
    } catch (error) {
      // error should be NOT_FOUND
      const errorCode = error.message;
      assert.equal(errorCode, ErrorCodes.NOT_FOUND, 'should throw ErrorCodes.NOT_FOUND');
    }
    // did not FAIL - that is an error
    assert.isUndefined(nonExisting, `User should not be defined ${args.account}`);

    // get user - should exist
    const user = yield contract.getUser(args.account, chainID);
    assert.equal(user.account, args.account, 'account should be found');
  });

  it('Get Users', function* () {
    const args = createUserArgs(stratoUser1.address);

    // get user - should exist
    {
      const users = yield contract.getUsers(chainID);
      const found = users.filter(function (user) {
        return user.account === args.account;
      });
      assert.isTrue(Boolean(found.length));
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

  it('Get account', function* () {
    const args = createUserArgs(stratoUser1.address);
    // check account
    const account = (yield rest.getAccount(args.account))[0];
    assert.equal(account.address, stratoUser1.address, 'address');
  });

  it('Get balance', function* () {
    const args = createUserArgs(stratoUser1.address);
    // create user
    const balance = yield contract.getBalance(args.account, chainID);
    assert.exists(balance);
  });

  //TODO: due to }, !ptions.doNotResolve, options.chainId) ptions is not defined 
  it.skip('Send funds wei ----skipping', function* () {
    const buyerArgs = createUserArgs(stratoUser2.address, UserRole.BUYER);
    const buyerAccount = yield contract.createUser(buyerArgs, chainID);
    buyerAccount.startingBalance = yield contract.getBalance(stratoUser2.address, chainID);
    
    const supplierAccount = yield contract.getUser(stratoUser1.address, chainID);
    supplierAccount.startingBalance = yield contract.getBalance(stratoUser1.address, chainID);

    // TRANSACTION
    // function* send(fromUser, toUser, value, nonce, node)
    const value = new BigNumber(12).mul(constants.ETHER);
    const receipt = yield rest.send(accessToken, { address: supplierAccount.account }, value, { chainId: chainID });
    const txResult = yield rest.transactionResult(receipt.hash, { chainId: chainID });
    assert.equal(txResult.status, 'success');

    // TODO:
    // // check balances
    // buyerAccount.endBalance = yield contract.getBalance(buyerAccount.username, chainID);
    // supplierAccount.endBalance = yield contract.getBalance(supplierAccount.username, chainID);
    // // buyer end balance = start - value - fee
    // buyerAccount.startingBalance.minus(value).should.be.bignumber.gt(buyerAccount.endBalance);
    // // supplier end balance = start + value
    // supplierAccount.startingBalance.plus(value).should.be.bignumber.eq(supplierAccount.endBalance);
  });
});

// function createUser(address account, string username, bytes32 pwHash, UserRole role) returns (ErrorCodes) {
function createUserArgs(_account, _role) {
  const role = _role || UserRole.SUPPLIER;
  const args = {
    account: _account,
    role: role,
  }
  return args;
}
