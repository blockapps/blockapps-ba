const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;

const projectManager = require('./projectManager');

describe('Deploy Project', function () {
  this.timeout(config.timeout);

  it('should deploy', function (done) {
  const scope = {};
    rest.setScope(scope)
      .then(projectManager.compileSearch())
      .then(function (scope) {
        done();
      }).catch(done);
  });
});
