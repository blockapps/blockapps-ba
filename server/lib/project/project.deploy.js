const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;

const project = require('./project');

describe('Deploy Project', function () {
  this.timeout(config.timeout);

  it('should deploy', function (done) {
  const scope = {};
    rest.setScope(scope)
      .then(project.compileSearch())
      .then(function (scope) {
        done();
      }).catch(done);
  });
});
