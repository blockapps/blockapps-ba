const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;

const bid = require('./bid');

describe('Deploy Project', function () {
  this.timeout(config.timeout);

  it('should deploy', function (done) {
    const scope = {};
    rest.setScope(scope)
      .then(bid.compileSearch())
      .then(function (scope) {
        done();
      }).catch(done);
  });
});
