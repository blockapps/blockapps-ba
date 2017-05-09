const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;
const util = common.util;
const path = require('path');
const serverPath = './server';
const dapp = require(`${path.join(process.cwd(), serverPath)}/dapp/dapp.js`)(config.contractsPath);

const deploy = {
  adminName: 'admin',
  adminPassword: '1234'
};

const loginController = {
  login: function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    rest.setScope()
      // .then(dapp.setAdmin(deploy.adminName, deploy.adminPassword, deploy.AdminInterface.address))
      .then(dapp.login(deploy.adminName, username, password))
      .then(scope => {
        util.response.status200(res, {
          authenticate: true,
          user: scope.user
        });
      })
      .catch(err => {
        util.response.status500(res, err);
      });
  }
}

module.exports = loginController;
