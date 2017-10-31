const co = require('co');
const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;
const util = common.util;
const path = require('path');
const serverPath = './server';

const loginController = {
  login: function(req, res) {
    const deploy = req.app.get('deploy');
    const username = req.body.username;
    const password = req.body.password;
    const dappJs = require(`${path.join(process.cwd(), serverPath)}/dapp/dapp.js`);

    co(function* () {
      const dapp = yield dappJs.setContract(deploy.admin, deploy.contract);
      const result = yield dapp.login(username, password);
      if(!result.authenticate) {
        util.response.status(401, res, 'Login failed');
        return;
      }
      util.response.status200(res, result);
    }).catch(err => {
      console.log('Login Error:', err);
      util.response.status(401, res, 'Login failed');
    });
  }
}

module.exports = loginController;
