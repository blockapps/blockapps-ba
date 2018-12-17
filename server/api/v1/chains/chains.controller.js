const co = require('co');
const ba = require('blockapps-rest');
const rest = ba.rest6;
const common = ba.common;
const api = common.api;
const config = common.config;
const util = common.util;
const fsutil = common.fsutil;
const dappJs = require(`../../../dapp/dapp`);
const utils = require('../../../utils');

const chains = {
  create: function (req, res) {
    const accessToken = utils.getAccessTokenFromCookie(req);
    let isChainIdExists = false;

    co(function* () {
      // Chain Data to create a new one
      const { label, members, balances, src, args, contract, enode, users } = req.body.chain;

      const chainID = yield rest.createChain(label, members, balances, src, args, contract, enode);

      const deploy = fsutil.yamlSafeLoadSync(config.deployFilename, config.apiDebug);
      const keys = deploy ? Object.keys(deploy) : [];

      keys.forEach((value) => {
        if (value === chainID) {
          isChainIdExists = true;
          util.response.status500(res, 'Chain already exists');
        }
      })

      if (!isChainIdExists) {
        const dapp = yield dappJs.uploadContract(accessToken, config.libPath, chainID);
        yield dapp.deploy(config.dataFilename, config.deployFilename, chainID);

        for (user of users) {
          yield dapp.createUser({ role: user.role, address: user.address }, chainID);
        }

        util.response.status200(res, 'Chain Created Successfully');
      }
    }).catch(err => {
      console.log('Create Chain Error:', err);
      util.response.status(401, res, 'Failed to create');
    });
  },
  get: function (req, res) {
    co(function* () {
      const chains = yield api.strato.chain();
      util.response.status200(res, chains);
    }).catch(err => {
      console.log('Create Chain Error:', err);
      util.response.status(401, res, 'Failed to fetch chain list');
    });
  }
};

module.exports = chains;
