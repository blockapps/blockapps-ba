const co = require('co');
const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;
const util = common.util;
const fsutil = common.fsutil;
const path = require('path');
const serverPath = './server';
const dappJs = require(`${path.join(process.cwd(), serverPath)}/dapp/dapp.js`);
const fs = require('fs');

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
};

module.exports = uploadContractsController;
