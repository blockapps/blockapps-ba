const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;
const util = common.util;
const path = require('path');
const serverPath = './server';
const dapp = require(`${path.join(process.cwd(), serverPath)}/dapp/dapp.js`)(config.contractsPath);

const projectsController = {
  create: function(req, res) {
    const deploy = req.app.get('deploy');
    const projectName = req.body.projectName;
    const buyer = req.body.buyer;
    const projectId = req.body.projectId;

    dapp.setScope()
      .then(dapp.setAdmin(deploy.adminName, deploy.adminPassword, deploy.AdminInterface.address))
      .then(dapp.createProject(
        deploy.adminName,
        buyer,
        projectId
      ))
      .then(scope => {
        util.response.status200(res, {
          authenticate: true,
          user: scope.result.user
        });
      })
      .catch(err => {
        util.response.status500(res, err);
      });
  }
};

module.exports = projectsController;
