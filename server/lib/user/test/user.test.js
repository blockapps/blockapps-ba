require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest6;
const common = ba.common;
const config = common.config;
const assert = common.assert;

const userJs = require('../user');
const utils = require('../../../utils');
const { createChainArgs } = require('../../utils/chain');

const userAccessToken1 = process.env.USER_ACCESS_TOKEN_1;

describe('User tests', function () {
  this.timeout(config.timeout);

  let userCreated, chainID;

  before(function* () {
    // decode and create new account
    const userEmail = utils.getEmailIdFromToken(userAccessToken1);
    userCreated = yield utils.createUser(userAccessToken1, userEmail);

    const chain = createChainArgs([userCreated.address]);

    chainID = yield rest.createChain(chain.label, chain.members, chain.balances, chain.src, chain.args);
  });

  it('Create Contract', function* () {
    const id = 123;
    const role = userJs.UserRole.SUPPLIER;
    const account = userCreated.address;

    // function User(address _account, uint _id, UserRole _role) {
    const args = {
      _account: account,
      _id: id,
      _role: role
    };

    // create the user with constructor args
    const contract = yield userJs.uploadContract(userAccessToken1, args, chainID);
    const user = yield contract.getState(chainID);
    assert.equal(user.account, account, 'account');
    assert.equal(user.id, id, 'id');
    assert.equal(user.role, role, 'role');
  });

  it('Search Contract', function* () {
    const id = 456;
    const role = userJs.UserRole.SUPPLIER;
    const account = userCreated.address;

    // function User(address _account, uint _id, UserRole _role) {
    const args = {
      _account: account,
      _id: id,
      _role: role,
    };

    // create the user with constructor args
    const contract = yield userJs.uploadContract(userAccessToken1, args, chainID);
    // search
    const user = yield userJs.getUserById(id, chainID);

    assert.equal(user.account, account, 'account');
    assert.equal(user.id, id, 'id');
    assert.equal(user.role, role, 'role');
  });

});
