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
  getBalance: function (req, res) {
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
  },

  create: function (req, res) {
    const chainId = req.body.chainId;
    const payload = {
      username: req.body.username,
      address: req.body.address,
      password: req.body.password,
      role: req.body.role
    }

    co(function* () {
      const deploy = fsutil.yamlSafeLoadSync(config.deployFilename, config.apiDebug);
      const data = deploy[chainId];

      if (data) {
        const chain = yield rest.getChainInfo(chainId);
        let isMemberExists = false;

        for (let member of chain.members) {
          if (payload.address === member.address) {
            isMemberExists = true;
          }
        }

        if (isMemberExists) {
          // Remove when we have actual password checking API
          const fromandToUser = {
            name: req.body.username,
            address: req.body.address,
            password: req.body.password
          }
          const send = yield rest.send(fromandToUser, fromandToUser, 0);
          // ---------------------------------------------------

          const dapp = yield dappJs.setContract(data.admin, data.contract, chainId);
          const user = yield dapp.createUser(payload, chainId);

          util.response.status(200, res, user);
        } else {
          util.response.status(401, res, 'this account is not a part of the chain');
        }

      } else {
        util.response.status(401, res, 'Contracts are not deployed on this chain! please deploy contracts first');
      }
    }).catch(err => {
      console.log('Create User Error:', err);
      if (err.data === '"incorrect password"') {
        util.response.status(401, res, 'Incorrect password');
      }
      util.response.status(401, res, 'Failed to create user');
    });
  }
}

module.exports = usersController;
