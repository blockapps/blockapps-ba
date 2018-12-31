require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest6;
const common = ba.common;
const config = common.config;
const util = common.util;
const assert = common.assert;
const constants = common.constants;
const BigNumber = common.BigNumber

const bidJs = require('../bid');
const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;

const accessToken = process.env.ADMIN_TOKEN;
let admin;

describe('Bid tests', function() {
  this.timeout(config.timeout);

  it('Create Contract', function* () {
    const id = new Date().getTime();
    const name = util.uid('Project');
    const supplier = 'Supplier1';
    const amount = 2345;

    const args = {
      _id: id,
      _name: name,
      _supplier: supplier,
      _amount: amount,
    };

    const contract = yield bidJs.uploadContract(accessToken, args);
    const bid = yield contract.getState();
    assert.equal(bid.id, id, 'id');
    assert.equal(bid.name, name, 'name');
    assert.equal(bid.supplier, supplier, 'supplier');
    assert.equal(bid.amount, amount, 'amount');
  });

  it('Search Contract', function* () {
    const id = new Date().getTime();
    const name = util.uid('Project');
    const supplier = 'Supplier1';
    const amount = 2345;

    const args = {
      _id: id,
      _name: name,
      _supplier: supplier,
      _amount: amount,
    };

    const contract = yield bidJs.uploadContract(accessToken, args);

    const queryResults = yield rest.waitQuery(`${bidJs.contractName}?id=eq.${id}`, 1);
    const bid = queryResults[0];
    assert.equal(bid.id, id, 'id');
    assert.equal(bid.name, name, 'name');
    assert.equal(bid.supplier, supplier, 'supplier');
    assert.equal(bid.amount, amount, 'amount');
  });


  // TODO: function* sendOAuth(token, toUser, value, options={}) { is not working as expected
  it.skip('Call method with value', function* () {
    const id = new Date().getTime();
    const name = util.uid('Project');
    const supplier = 'Supplier1';
    const amount = 2345;

    const contractArgs = {
      _id: id,
      _name: name,
      _supplier: supplier,
      _amount: amount,
    };

    const contract = yield bidJs.uploadContract(accessToken, contractArgs);

    // function setBidState(address bidAddress, BidState state) returns (ErrorCodes) {
    const method = 'setBidState';
    const methodArgs = {
      newState: 2,
    };

    // create target user
    const username = util.uid('Bob');
    const password = '1234';
    const bob = yield rest.createUser(username, password);

    // send tx - works
    const sendValue = 123;
    const receipt = yield rest.send(accessToken, bob, sendValue);
    const txResult = yield rest.transactionResult(receipt.hash);
    assert.equal(txResult[0].status, 'success');

    // call method WITHOUT value
    const result = yield rest.callMethod(accessToken, contract, method, methodArgs);
    const errorCode = parseInt(result[0]);
    assert.equal(errorCode, ErrorCodes.SUCCESS);

    // call method WITH value
    const value = (new BigNumber(23)).mul(constants.ETHER);
    admin.startBalance = yield rest.getBalance(admin.address);
    contract.startBalance = yield rest.getBalance(contract.address);
    yield rest.callMethod(accessToken, contract, method, methodArgs, value);
    admin.endBalance = yield rest.getBalance(admin.address);
    admin.delta = admin.endBalance.minus(admin.startBalance).times(-1);
    admin.delta.should.be.bignumber.gt(value);

    contract.endBalance = yield rest.getBalance(contract.address);
    contract.delta = contract.endBalance.minus(contract.startBalance);
    contract.delta.should.be.bignumber.equal(value);
  });
});
