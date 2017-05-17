const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;
const util = common.util;
const path = require('path');
const serverPath = './server';
const dapp = require(`${path.join(process.cwd(), serverPath)}/dapp/dapp.js`)(config.contractsPath);
const ProjectState = ba.rest.getEnums(`${config.libPath}/project/contracts/ProjectState.sol`).ProjectState;

const usersController = {
  getBalance: function(req, res) {
    const deploy = req.app.get('deploy');
    const username = decodeURI(req.params['username']);
    dapp.setScope()
      .then(dapp.setAdmin(deploy.adminName, deploy.adminPassword, deploy.AdminInterface.address, deploy.adminAddress))
      .then(dapp.getBalance(
        deploy.adminName,
        username
      ))
      .then(scope => {
        util.response.status200(res, {
          // this is a bignumber
          balance: scope.result
        });
      })
      .catch(err => {
        util.response.status500(res, err);
      });
  }
}

module.exports = usersController;
