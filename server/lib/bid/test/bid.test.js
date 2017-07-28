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
var admin;

describe('Bid tests', function() {
  this.timeout(config.timeout);

  before(function* () {
    admin = yield rest.createUser(adminName, adminPassword);
    // compile if needed
    yield bidJs.compileSearch(true);
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
    const bid = yield bidJs.getState(contract);
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


  it('Call method with value 1.0', function* () {
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

    // function setBidState(address bidAddress, BidState state) returns (ErrorCodes) {
    const method = 'setBidState';
    const margs = {
      newState: 2,
    };

    // create target user
    const bob = yield rest.createUser(adminName+'bob', adminPassword);
    // send tx - works
    const sendValueEther = 1;
    const receipt = yield rest.send(admin, bob, sendValueEther);
    const txResult = yield rest.transactionResult(receipt.hash);
    assert.equal(txResult[0].status, 'success');

    // call method WITHOUT value
    const result = yield rest.callMethod(admin, contract, method, margs);
    const errorCode = parseInt(result[0]);
    if (errorCode != ErrorCodes.SUCCESS) {
      throw new Error(errorCode);
    }
    // call method WITH value
    const valueEther = 1.0;
    const valueWei = (new BigNumber(valueEther)).mul(constants.ETHER);
    admin.startBalance = yield rest.getBalance(admin.address);
    contract.startBalance = yield rest.getBalance(contract.address);
    yield rest.callMethod(admin, contract, method, margs, valueEther);
    admin.endBalance = yield rest.getBalance(admin.address);
    admin.delta = admin.endBalance.minus(admin.startBalance).times(-1);
    admin.delta.should.be.bignumber.gt(valueWei);

    contract.endBalance = yield rest.getBalance(contract.address);
    contract.delta = contract.endBalance.minus(contract.startBalance);
    contract.delta.should.be.bignumber.equal(valueWei);
  });

  it.skip('Call method with value 1.5   https://blockapps.atlassian.net/browse/API-16', function* () {
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

    // function setBidState(address bidAddress, BidState state) returns (ErrorCodes) {
    const method = 'setBidState';
    const margs = {
      newState: 2,
    };

    // create target user
    const bob = yield rest.createUser(adminName+'bob', adminPassword);
    // send tx - works
    const sendValueEther = 1;
    const receipt = yield rest.send(admin, bob, sendValueEther);
    const txResult = yield rest.transactionResult(receipt.hash);
    assert.equal(txResult[0].status, 'success');

    // call method WITHOUT value
    const result = yield rest.callMethod(admin, contract, method, margs);
    const errorCode = parseInt(result[0]);
    if (errorCode != ErrorCodes.SUCCESS) {
      throw new Error(errorCode);
    }
    // call method WITH value
    const valueEther = 1.5;
    const valueWei = (new BigNumber(valueEther)).mul(constants.ETHER);
    admin.startBalance = yield rest.getBalance(admin.address);
    contract.startBalance = yield rest.getBalance(contract.address);
    yield rest.callMethod(admin, contract, method, margs, valueEther);
    admin.endBalance = yield rest.getBalance(admin.address);
    admin.delta = admin.endBalance.minus(admin.startBalance).times(-1);
    admin.delta.should.be.bignumber.gt(valueWei);

    contract.endBalance = yield rest.getBalance(contract.address);
    contract.delta = contract.endBalance.minus(contract.startBalance);
    contract.delta.should.be.bignumber.equal(valueWei);
  });

});
