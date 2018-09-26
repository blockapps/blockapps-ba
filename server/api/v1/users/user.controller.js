const co = require('co');
const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const fsutil = ba.common.fsutil;
const config = common.config;
const util = common.util;
const path = require('path');
const serverPath = './server';
const dappJs = require(`${path.join(process.cwd(), serverPath)}/dapp/dapp.js`);
const BigNumber = common.BigNumber
const constants = common.constants

const usersController = {
  getBalance: function(req, res) {
    // const deploy = req.app.get('deploy');
    const chainId = req.query['chainId'];

    const deploy = fsutil.yamlSafeLoadSync(config.deployFilename, config.apiDebug);
    const data = deploy[chainId];
    const username = decodeURI(req.params['username']);
    
    co(function* () {
      const dapp = yield dappJs.setContract(data.admin, data.contract, chainId);
      const balance = yield dapp.getBalance(username, chainId);

      util.response.status200(res, {
        // this is a bignumber
        balance: balance,
        balanceString: new BigNumber(balance).div(constants.ETHER).toFixed(2)
      });
    }).catch(err => {
      console.log('User Balance Error:', err);
      util.response.status500(res, 'Could not get user balance');
    });
  }
}

module.exports = usersController;
