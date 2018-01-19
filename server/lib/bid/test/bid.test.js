require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;
const util = common.util;
const should = common.should;
const assert = common.assert;
const constants = common.constants;
const Promise = common.Promise;
const BigNumber = common.BigNumber

const bidJs = require('../bid');
const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;

const adminName = util.uid('Admin');
const adminPassword = '1234';
let admin;

describe('Bid tests', function() {
  this.timeout(config.timeout);

  before(function* () {
    admin = yield rest.createUser(adminName, adminPassword);
  })

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

    const contract = yield bidJs.uploadContract(admin, args);
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

    const contract = yield bidJs.uploadContract(admin, args);

    const queryResults = yield rest.waitQuery(`${bidJs.contractName}?id=eq.${id}`, 1);
    const bid = queryResults[0];
    assert.equal(bid.id, id, 'id');
    assert.equal(bid.name, name, 'name');
    assert.equal(bid.supplier, supplier, 'supplier');
    assert.equal(bid.amount, amount, 'amount');
  });


  it('Call method with value', function* () {
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

    const contract = yield bidJs.uploadContract(admin, contractArgs);

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
    const receipt = yield rest.send(admin, bob, sendValue);
    const txResult = yield rest.transactionResult(receipt.hash);
    assert.equal(txResult[0].status, 'success');

    // call method WITHOUT value
    const result = yield rest.callMethod(admin, contract, method, methodArgs);
    const errorCode = parseInt(result[0]);
    assert.equal(errorCode, ErrorCodes.SUCCESS);

    // call method WITH value
    const value = (new BigNumber(23)).mul(constants.ETHER);
    admin.startBalance = yield rest.getBalance(admin.address);
    contract.startBalance = yield rest.getBalance(contract.address);
    yield rest.callMethod(admin, contract, method, methodArgs, value);
    admin.endBalance = yield rest.getBalance(admin.address);
    admin.delta = admin.endBalance.minus(admin.startBalance).times(-1);
    admin.delta.should.be.bignumber.gt(value);

    contract.endBalance = yield rest.getBalance(contract.address);
    contract.delta = contract.endBalance.minus(contract.startBalance);
    contract.delta.should.be.bignumber.equal(value);
  });

  it('Call method with value - Insufficient balance', function* () {
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

    const contract = yield bidJs.uploadContract(admin, contractArgs);

    // function setBidState(address bidAddress, BidState state) returns (ErrorCodes) {
    const method = 'setBidState';
    const methodArgs = {
      newState: 2,
    };

    // create target user
    const username = util.uid('Bob');
    const password = '1234';
    const bob = yield rest.createUser(username, password);
    // call method WITH value
    const value = (new BigNumber(1234)).mul(constants.ETHER);
    let result;
    try {
      result = yield rest.callMethod(admin, contract, method, methodArgs, value);
    } catch(error) {
      assert.equal(error.name, 'HttpError400');
      assert.equal(error.status, '400');
    }
    // if didnt throw - error
    assert.isUndefined(result, 'call should have thrown INSUFFICIENT BALANCE, and not return a result');
  });
});
