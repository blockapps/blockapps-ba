const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const ba = require('blockapps-rest');
const common = ba.common;
const should = ba.common.should;
const assert = ba.common.assert;
const expect = ba.common.expect;
const constants = common.constants;
const BigNumber = common.BigNumber;

chai.use(chaiHttp);

describe("User Test", function(){
  const username = "Supplier1";
  const password = "1234";
  const timeout = 20 * 1000;

  it('should return user balance', function(done) {
    this.timeout(timeout);
    chai.request(server)
      .get('/api/v1/users/' + username + '/balance')
      .end((err, res) => {
        const data = assert.apiData(err, res);
        const balance = data.balance;
        const faucetBalance = new BigNumber(1000).times(constants.ETHER);
        balance.should.be.bignumber.equal(faucetBalance);
        done();
      });
  });
});
