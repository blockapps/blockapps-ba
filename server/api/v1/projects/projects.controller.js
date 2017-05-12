const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;
const util = common.util;
const path = require('path');
const serverPath = './server';
const dapp = require(`${path.join(process.cwd(), serverPath)}/dapp/dapp.js`)(config.contractsPath);
const ProjectState = ba.rest.getEnums(`${config.libPath}/project/contracts/ProjectState.sol`).ProjectState;

const projectsController = {
  create: function(req, res) {
    const deploy = req.app.get('deploy');
    const project = req.body;

    dapp.setScope()
      .then(dapp.setAdmin(deploy.adminName, deploy.adminPassword, deploy.AdminInterface.address))
      .then(dapp.createProject(
        deploy.adminName,
        project.name,
        project.buyer
      ))
      .then(scope => {
        util.response.status200(res, {
          project: scope.result
        });
      })
      .catch(err => {
        util.response.status500(res, err);
      });
  },

  get: function(req, res) {
    const deploy = req.app.get('deploy');
    const projectName = decodeURI(req.params['pName']);
    dapp.setScope()
      .then(dapp.setAdmin(deploy.adminName, deploy.adminPassword, deploy.AdminInterface.address))
      .then(dapp.getProject(
        deploy.adminName,
        projectName
      ))
      .then(scope => {
        util.response.status200(res, {
          project: scope.result
        });
      })
      .catch(err => {
        util.response.status500(res, err);
      });
  },

  list: function(req, res) {
    const deploy = req.app.get('deploy');
    const filter = req.query['filter'];
    const buyer = req.query['buyer'];
    const state = req.query['state'];

    let listCallback = 'getProjects';
    let listParam;
    if (filter === 'buyer') {
      listCallback = 'getProjectsByBuyer';
      listParam = buyer;
    } else if (filter === 'state') {
      listCallback = 'getProjectsByState';
      listParam = state;
    }

    dapp.setScope()
      .then(dapp.setAdmin(deploy.adminName, deploy.adminPassword, deploy.AdminInterface.address))
      .then(dapp[listCallback](listParam))
      .then(scope => {
        util.response.status200(res, {
          projects: scope.result
        });
      })
      .catch(err => {
        util.response.status500(res, err);
      });
  },

  bid: function(req, res) {
    const deploy = req.app.get('deploy');
    console.log('>>>> route >>>>', req.params.name, req.body.supplier, req.body.amount);
    dapp.setScope()
      .then(dapp.setAdmin(deploy.adminName, deploy.adminPassword, deploy.AdminInterface.address))
      .then(dapp.createBid(
        deploy.adminName,
        req.params.name,
        req.body.supplier,
        req.body.amount))
      .then(scope => {
        util.response.status200(res, {
          bid: scope.result
        })
      })
      .catch(err => {
        util.response.status500(res, err);
      })
  }
};

module.exports = projectsController;
