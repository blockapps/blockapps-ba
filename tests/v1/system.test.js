const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const ba = require('blockapps-rest');
const should = ba.common.should;
const assert = ba.common.assert;
const config = ba.common.config;

chai.use(chaiHttp);

describe("System requests test", function() {
  it('should return explorer url', function(done) {
    chai.request(server)
      .get('/api/v1/system/explorer-url')
      .end((err, res) => {
        const explorerUrl = config.getExplorerUrl();
        const data = assert.apiData(err, res);
        const explorerUrlData = data.explorerUrl;
        assert.isOk(explorerUrlData, 'explorerUrl should not be empty');
        assert.equal(explorerUrlData, explorerUrl, 'explorer url should be' + explorerUrl);
        done();
      });
  });
});
