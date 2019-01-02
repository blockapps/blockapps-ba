require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest6;
const common = ba.common;
const config = common.config;
const util = common.util;
const assert = common.assert;

const bidJs = require('../bid');

const userAccessToken1 = process.env.USER_ACCESS_TOKEN_1;

describe('Bid tests', function () {

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

    const contract = yield bidJs.uploadContract(userAccessToken1, args);
    {
      const bid = yield contract.getState();
      assert.equal(bid.id, id, 'id');
      assert.equal(bid.name, name, 'name');
      assert.equal(bid.supplier, supplier, 'supplier');
      assert.equal(bid.amount, amount, 'amount');
    }

    const queryResults = yield rest.waitQuery(`${bidJs.contractName}?id=eq.${id}`, 1);
    {
      const bid = queryResults[0];
      assert.equal(bid.id, id, 'id');
      assert.equal(bid.name, name, 'name');
      assert.equal(bid.supplier, supplier, 'supplier');
      assert.equal(bid.amount, amount, 'amount');
    }
  });



  it.only('Create many contract', function* () {
    this.timeout(config.timeout * 10);

    const id = new Date().getTime();
    for (let i = 0; i < 10; i++) {
      const args = createContractArgs(id, i);
      const contract = yield bidJs.uploadContract(userAccessToken1, args);
      {
        const bid = yield contract.getState();
        assert.equal(bid.id, args._id, 'id');
        assert.equal(bid.name, args._name, 'name');
        assert.equal(bid.supplier, args._supplier, 'supplier');
        assert.equal(bid.amount, args._amount, 'amount');
      }
      const queryResults = yield rest.waitQuery(`${bidJs.contractName}?id=eq.${args._id}`, 1);
      {
        const bid = queryResults[0];
        assert.equal(bid.id, args._id, 'id');
        assert.equal(bid.name, args._name, 'name');
        assert.equal(bid.supplier, args._supplier, 'supplier');
        assert.equal(bid.amount, args._amount, 'amount');
      }
    }

    function createContractArgs(id, index) {
      const args = {
        _id: id + index,
        _name: `Project_${id}_${index}`,
        _supplier: `Supplier1`,
        _amount: index,
      };
      return args;
    }

  });

});
