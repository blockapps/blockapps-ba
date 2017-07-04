require('co-mocha');
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
    const dapp = require(`${path.join(process.cwd(), serverPath)}/dapp/dapp.js`)(config.libPath);

    co(function *() {
      const AI = yield dapp.getAdminInterface(deploy.AdminInterface.address);
      const result = yield dapp.login(deploy.admin, username, password);
      util.response.status200(res, {
        authenticate: true,
        user: result.user
      });
    }).catch(function(err) {
      console.log('Login Error:', err);
      util.response.status(401, res, 'Login failed');
    });
  }
}

module.exports = loginController;
