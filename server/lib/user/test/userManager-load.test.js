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

const jwtDecode = require('jwt-decode');
const utils = require('../../../utils');
const userManagerJs = require('../userManager');

const accessToken = process.env.ADMIN_TOKEN;

describe('UserManager LOAD tests', function() {
  this.timeout(config.timeout);

  let userCreated;
  let contract;
  let chainID;

  // get ready:  admin-user and manager-contract
  before(function* () {
    // decode and create new account
    const decodedToken = jwtDecode(accessToken);
    const userEmail = decodedToken['email'];
    userCreated = yield utils.createUser(accessToken, userEmail);

    const chain = {
      label: 'test airline',
      src: 'contract Governance { }',
      args: {},
      members: [{
        address: userCreated.address,
        enode: "enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303?discport=30303"
      }],
      balances: [{
        address: userCreated.address,
        balance: 1000000000000000000000000
      }]
    }

    chainID = yield rest.createChain(chain.label, chain.members, chain.balances, chain.src, chain.args);
    contract = yield userManagerJs.uploadContract(accessToken, {}, chainID);
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
