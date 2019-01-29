require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;
const util = common.util;
const assert = common.assert;

const UserRole = rest.getEnums(`${config.libPath}/user/contracts/UserRole.sol`).UserRole;

const utils = require('../../../utils');
const userManagerJs = require('../userManager');
const { createChainArgs } = require('../../utils/chain');

const userAccessToken1 = process.env.USER_ACCESS_TOKEN_1;

describe('UserManager LOAD tests', function() {
  this.timeout(config.timeout);

  let userCreated;
  let contract;
  let chainID;

  // get ready:  admin-user and manager-contract
  before(function* () {
    // decode and create new account
    const userEmail = utils.getEmailIdFromToken(userAccessToken1);
    userCreated = yield utils.createUser(userAccessToken1, userEmail);

    const chain = createChainArgs([userCreated.address]);
    chainID = yield rest.createChain(chain.label, chain.members, chain.balances, chain.src, chain.args);
    contract = yield userManagerJs.uploadContract(userAccessToken1, {}, chainID);
  });

  it.skip('User address leading zeros - load test - skipped', function *() {
    this.timeout(60*60*1000);

    const count = 16*4; // leading 0 once every 16
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
    const comparator = function(a, b) { return a.username == b.username; };
    const notFound = util.filter.isContained(users, resultUsers, comparator, true);
    assert.equal(notFound.length, 0, JSON.stringify(notFound));
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
