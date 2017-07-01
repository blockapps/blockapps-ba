const ba = require('blockapps-rest');
require('co-mocha');
const rest = ba.rest;
const common = ba.common;
const config = common.config;
const util = common.util;
const should = common.should;
const assert = common.assert;
const Promise = common.Promise;

const bid = require('../bid');

const adminName = util.uid('Admin');
const adminPassword = '1234';
var admin;

describe('Bid tests', function() {
  this.timeout(config.timeout);

  before(function*() {
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

    const contract = yield bid.uploadContract(admin, args);
    const mybid = yield bid.getState(contract);
    assert.equal(mybid.id, id, 'id');
    assert.equal(mybid.name, name, 'name');
    assert.equal(mybid.supplier, supplier, 'supplier');
    assert.equal(mybid.amount, amount, 'amount');
  });

  it('Search Contract - deploy if needed', function* () {
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

    const contract = yield bid.uploadContract(admin, args);

    const isCompiled = yield bid.isCompiled();
    if (!isCompiled) {
      const result = yield bid.compileSearch();
    }

    const queryResults = yield rest.waitQuery(`${bid.contractName}?id=eq.${id}`, 1);
    const mybid = queryResults[0];
    assert.equal(mybid.id, id, 'id');
    assert.equal(mybid.name, name, 'name');
    assert.equal(mybid.supplier, supplier, 'supplier');
    assert.equal(mybid.amount, amount, 'amount');
  });
});
