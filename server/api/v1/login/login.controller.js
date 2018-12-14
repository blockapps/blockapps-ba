const co = require('co');
const ba = require('blockapps-rest');
const rest = ba.rest6;
const common = ba.common;
const fsutil = ba.common.fsutil;
const config = common.config;
const util = common.util;
const path = require('path');
const serverPath = './server';
const utils = require('../../../utils');
const dappJs = require(`${path.join(process.cwd(), serverPath)}/dapp/dapp.js`);

const loginController = {
  login: function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const chainId = req.body.chainId;

    co(function* () {
      const deploy = fsutil.yamlSafeLoadSync(config.deployFilename, config.apiDebug);
      const data = deploy[chainId];

      if (!data) {
        util.response.status(401, res, 'Contracts are not deployed on this chain! please deploy contracts first');
      } else {
        const dapp = yield dappJs.setContract(data.admin, data.contract, chainId);
        const result = yield dapp.login(username, password, chainId);
        if (!result.authenticate) {
          util.response.status(401, res, 'Login failed');
          return;
        }
        util.response.status200(res, result);
      }

    }).catch(err => {
      console.log('Login Error:', err);
      util.response.status(401, res, 'Login failed');
    });
  },
  getUser: function (req, res) {
    const { chainId, address } = req.query;
    const accessToken = utils.getAccessTokenFromCookie(req);

    co(function* () {
      const deploy = fsutil.yamlSafeLoadSync(config.deployFilename, config.apiDebug);
      const data = deploy[chainId];

      if (!data) {
        util.response.status(401, res, 'Contracts are not deployed on this chain! please deploy contracts first');
      } else {
        const dapp = yield dappJs.setContract(accessToken, data.contract, chainId);
        const result = yield dapp.getUserByAccount(address, chainId);
        util.response.status200(res, result);
      }

    }).catch(err => {
      console.log('Failed:', err);
      util.response.status(401, res, 'Failed to fetch user');
    });    
  }
}

module.exports = loginController;
