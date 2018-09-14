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
    let isChainIdExists = false;


    co(function* () {
      // TODO: check chainId is exists in yaml or not (reason deploy of contracts)
      const deploy = fsutil.yamlSafeLoadSync(config.deployFilename, config.apiDebug);
      const keys = Object.keys(deploy);

      keys.forEach((value) => {
        if (value === chainId) {
          isChainIdExists = true;
          util.response.status500(res, 'Contracts are already deployed');
        }
      })

      if (!isChainIdExists) {
        const adminName = util.uid('Admin');
        const adminPassword = '7890';

        const admin = yield rest.createUser(adminName, adminPassword);

        do {
          yield new Promise(resolve => setTimeout(resolve, 1000))
        } while ((yield rest.getBalance(admin.address)) < 1);

        const dapp = yield dappJs.uploadContract(admin, config.libPath);
        const deployment = yield dapp.deploy(config.dataFilename, config.deployFilename, chainId);

        util.response.status200(res, 'completed');
      }

    }).catch(err => {
      console.log('Upload Contracts Error:', err);
      util.response.status500(res, 'Unable to upload contracts');
    });

    // TODO: create two users as well
    // TODO: add chainId paramenter while uploading contracts
    // TODO: add chainId parameter in blockapps-rest API's
  },
};

module.exports = uploadContractsController;
