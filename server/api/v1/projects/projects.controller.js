const co = require('co');
const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;
const util = common.util;
const path = require('path');
const serverPath = './server';
const dappJs = require(`${path.join(process.cwd(), serverPath)}/dapp/dapp.js`);

const projectsController = {
  create: function(req, res) {
    const deploy = req.app.get('deploy');
    const projectArgs = req.body;

    co(function* () {
      const dapp = yield dappJs.setContract(deploy.admin, deploy.contract);
      const result = yield dapp.createProject(projectArgs);
      util.response.status200(res, {
        project: result,
      });
    }).catch(err => {
      console.log('Create Project Error:', err);
      util.response.status500(res, 'Unable to create project');
    });
  },

  get: function(req, res) {
    const deploy = req.app.get('deploy');
    const projectName = decodeURIComponent(req.params['name']);

    co(function* () {
      const dapp = yield dappJs.setContract(deploy.admin, deploy.contract);
      const result = yield dapp.getProject(projectName);
      util.response.status200(res, {
        project: result,
      });
    }).catch(err => {
      console.log('Get Projects Error:', err);
      util.response.status500(res, 'Cannot fetch projects');
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

    co(function* () {
      const dapp = yield dappJs.setContract(deploy.admin, deploy.contract);
      const projects = yield dapp[listCallback](listParam);
      util.response.status200(res, {
        projects: projects,
      });
    }).catch(err => {
      console.log('List Projects Error', err);
      util.response.status500(res, 'Error occurred while trying to list projects');
    });
  },

  bid: function(req, res) {
    const deploy = req.app.get('deploy');

    co(function* () {
      const dapp = yield dappJs.setContract(deploy.admin, deploy.contract);
      const bid = yield dapp.createBid(
        req.params.name,
        req.body.supplier,
        req.body.amount);
      util.response.status200(res, {
        bid: bid,
      });
    }).catch(err => {
      console.log('Bid Error:', err);
      util.response.status500(res, 'Error occurred while trying to submit bid');
    });
  },

  getBids: function(req, res) {
    const deploy = req.app.get('deploy');

    co(function* () {
      const dapp = yield dappJs.setContract(deploy.admin, deploy.contract);
      const bids = yield dapp.getBids(req.params.name);
      util.response.status200(res, {
        bids: bids,
      });
    }).catch(err => {
      console.log('Get Bids Error:', err);
      util.response.status500(res, 'Error occurred while trying to fetch bids');
    });
  },

  handleEvent: function(req, res) {
    const deploy = req.app.get('deploy');
    const username = req.body.username;

    co(function* () {
      const dapp = yield dappJs.setContract(deploy.admin, deploy.contract);
      // this transaction requires transfer of funds from the buyer to the bid contract
      // IRL this will require to prompt the user for a password
      const password = deploy.users.filter(function(user) {
        return user.username === username;
      })[0].password;

      const args = {
        projectEvent: req.body.projectEvent,
        projectName: req.params.name,
        username : username,
        password: password,
        bidId: req.body.bidId, // required for ProjectEvent.ACCEPT
      };

      const result = yield dapp.handleEvent(args);
      // got it
      util.response.status200(res, {
        bid: result,
        state: result,
      });
    }).catch(err => {
      console.log('Handle Event Error:', err);
      util.response.status500(res, err);
    });
  },
};

module.exports = projectsController;
