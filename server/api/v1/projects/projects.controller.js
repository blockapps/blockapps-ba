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
    const projectArgs = req.body;

    dapp.setScope()
      .then(dapp.setAdmin(deploy.adminName, deploy.adminPassword, deploy.AdminInterface.address))
      .then(dapp.createProject(deploy.adminName, projectArgs))
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
    const projectName = decodeURI(req.params['name']);
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

    let listCallback, listParam;
    switch (req.query['filter']) {
      case 'buyer':
        listCallback = 'getProjectsByBuyer';
        listParam = req.query['buyer'];
        break;
      case 'state':
        listCallback = 'getProjectsByState';
        listParam = req.query['state'];
        break;
      case 'supplier':
        listCallback = 'getProjectsBySupplier';
        listParam = req.query['supplier'];
        break;
      default:
        listCallback = 'getProjects'
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
  },

  getBids: function(req, res) {
    const deploy = req.app.get('deploy');
    dapp.setScope()
      .then(dapp.setAdmin(deploy.adminName, deploy.adminPassword, deploy.AdminInterface.address))
      .then(dapp.getBids(deploy.adminName, req.params.name))
      .then(scope => {
        util.response.status200(res, {
          bids: scope.result
        })
      })
      .catch(err => {
        util.response.status500(res, err);
      })
  },

  acceptBid: function(req, res) {
    const deploy = req.app.get('deploy');
    dapp.setScope()
      .then(dapp.setAdmin(deploy.adminName, deploy.adminPassword, deploy.AdminInterface.address))
      .then(
        dapp.acceptBid(
          deploy.adminName,
          req.params.id,
          req.params.name
        )
      )
      .then(scope => {
        util.response.status200(res, {
          bid: scope.result
        })
      })
      .catch(err => {
        util.response.status500(res, err);
      })
  },

  handleEvent: function(req, res) {
    const deploy = req.app.get('deploy');
    dapp.setScope()
      .then(dapp.setAdmin(deploy.adminName, deploy.adminPassword, deploy.AdminInterface.address))
      .then(
        dapp.handleEvent(
          deploy.adminName,
          req.params.name,
          req.body.projectEvent
        )
      )
      .then(scope => {
        util.response.status200(res, {
          bid: scope.result
        })
      })
      .catch(err => {
        util.response.status500(res, err);
      })
  },
};

module.exports = projectsController;
