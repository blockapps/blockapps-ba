const co = require('co');
const ba = require('blockapps-rest');
const rest = ba.rest6;
const common = ba.common;
const config = common.config;
const util = common.util;
const fsutil = common.fsutil;
const path = require('path');
const serverPath = './server';
const dappJs = require(`../../../dapp/dapp`);
const utils = require('../../../utils');

const uploadContractsController = {
  uploadContract: function (req, res) {
    const chainId = req.body.chainId;
    const username = req.body.username;
    const address = req.body.address;
    const password = req.body.password;
    let isChainIdExists = false;

    co(function* () {
      const deploy = fsutil.yamlSafeLoadSync(config.deployFilename, config.apiDebug);
      const keys = deploy ? Object.keys(deploy) : [];

      keys.forEach((value) => {
        if (value === chainId) {
          isChainIdExists = true;
          util.response.status500(res, 'Contracts are already deployed! You can login using this chain');
        }
      })

      if (!isChainIdExists) {
        admin = {
          "name": username,
          "password": password,
          "address": address
        }

        const dapp = yield dappJs.uploadContract(admin, config.libPath, chainId);
        const deployment = yield dapp.deploy(config.dataFilename, config.deployFilename, chainId);

        util.response.status200(res, 'Contracts deployed successfully');
      }

    }).catch(err => {
      console.log('Upload Contracts Error:', err);
      util.response.status500(res, 'Unable to upload contracts');
    });

  },

  createData: function (req, res) {
    const accessToken = utils.getAccessTokenFromCookie(req);
    let isChainIdExists = false;

    co(function* () {
      // Chain Data to create a new one
      const { label, members, balances, src, args, contract, enode, users } = req.body.chain;

      // create chain. TODO: add error handling
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
        const deployment = yield dapp.deploy(config.dataFilename, config.deployFilename, chainID);

        for (user of users) {
          const userData = yield dapp.createUser({role: user.role, address: user.address}, chainID);
        }
        
        util.response.status200(res, 'Chain Created Successfully');
      }
    });
  }
};

module.exports = uploadContractsController;
