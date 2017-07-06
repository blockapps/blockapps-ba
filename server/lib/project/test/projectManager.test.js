require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;
const util = common.util;
const should = common.should;
const assert = common.assert;
const constants = common.constants;
const Promise = common.Promise;
const BigNumber = common.BigNumber;

const project = require('../project');
const projectManager = require('../projectManager');
const userManager = require('../../user/userManager');
const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;
const ProjectState = rest.getEnums(`${config.libPath}/project/contracts/ProjectState.sol`).ProjectState;
const ProjectEvent = rest.getEnums(`${config.libPath}/project/contracts/ProjectEvent.sol`).ProjectEvent;
const BidState = rest.getEnums(`${config.libPath}/bid/contracts/BidState.sol`).BidState;
const UserRole = rest.getEnums(`${config.libPath}/user/contracts/UserRole.sol`).UserRole;

const adminName = util.uid('Admin');
const adminPassword = '1234';

describe('ProjectManager tests', function() {
  this.timeout(config.timeout);

  var admin;
  var contract;
  // get ready:  admin-user and manager-contract
  before(function* () {
    admin = yield rest.createUser(adminName, adminPassword);
    contract = yield projectManager.uploadContract(admin);
  });

  it('Create Project', function* () {
    const projectArgs = createProjectArgs();

    // create project
    const myProject = yield projectManager.createProject(admin, contract, projectArgs);
    assert.equal(myProject.name, projectArgs.name, 'name');
    assert.equal(myProject.buyer, projectArgs.buyer, 'buyer');
  });

  it('Test exists()', function* () {
    const projectArgs = createProjectArgs();
    // should not exists
    const doesNotExist = yield projectManager.exists(admin, contract, projectArgs.name);
    assert.isDefined(doesNotExist, 'should be defined');
    assert.isNotOk(doesNotExist, 'should not exist');
    // create project
    const myProject = yield projectManager.createProject(admin, contract, projectArgs);
    // // should exist
    const exists = yield projectManager.exists(admin, contract, projectArgs.name);
    assert.equal(exists, true, 'should exist');
  });

  it('Create Duplicate Project', function* () {
    const projectArgs = createProjectArgs();
    // create project
    const myProject = yield projectManager.createProject(admin, contract, projectArgs);
    // create a duplicate - should FAIL
    var dupProject;
    try {
      dupProject = yield projectManager.createProject(admin, contract, projectArgs);
    } catch(error) {
      const errorCode = parseInt(error.message);
      // error should be EXISTS
      assert.equal(errorCode, ErrorCodes.EXISTS, 'error should be EXISTS' + JSON.stringify(error));
      }
    // did not FAIL - that is an error
    assert.isUndefined(dupProject, 'creating duplicate project should fail');
  });

  it('Get Project', function* () {
    const projectArgs = createProjectArgs();
    // create project
    yield projectManager.createProject(admin, contract, projectArgs);
    const myProject = yield projectManager.getProject(admin, contract, projectArgs.name);
    assert.equal(myProject.name, projectArgs.name, 'should have a name');
  });

  it('Get non exisiting project', function* () {
    const projectArgs = createProjectArgs();
    var nonExistingProject;
    try {
      nonExistingProject = yield projectManager.getProject(admin, contract, projectArgs.name);
    } catch(error) {
      const errorCode = error.message;
      // error should be NOT_FOUND
      assert.equal(errorCode, ErrorCodes.NOT_FOUND, 'error should be NOT_FOUND' + JSON.stringify(error));
    }
    // did not FAIL - that is an error
    assert.isUndefined(nonExistingProject, 'getting non-existing project should fail');
  });

  it('Get Projects', function* () {
    const projectArgs = createProjectArgs();
    // get projects - should not exist yet
    {
      const projects = yield projectManager.getProjects(contract);
      const found = projects.filter(function(project) {
        return project.name === projectArgs.name;
      });
      assert.equal(found.length, 0, 'project list should NOT contain ' + projectArgs.name);
    }
    // create project
    yield projectManager.createProject(admin, contract, projectArgs);
    {
      // get projects - should exist
      const projects = yield projectManager.getProjects(contract);
      const found = projects.filter(function(project) {
        return project.name === projectArgs.name;
      });
      assert.equal(found.length, 1, 'project list should contain ' + projectArgs.name);
    }
  });
});

function createProjectArgs(_uid) {
  const uid = _uid || util.uid();
  const projectArgs = {
    name: 'Project_' + uid,
    buyer: 'Buyer_' + uid,
    description: 'description_' + uid,
    spec: 'spec_' + uid,
    price: 234,

    created: new Date().getTime(),
    targetDelivery: new Date().getTime() + 3 * 24*60*60*1000, // 3 days

    addressStreet: 'addressStreet_' + uid,
    addressCity: 'addressCity_' + uid,
    addressState: 'addressState_' + uid,
    addressZip: 'addressZip_' + uid,
  };

  return projectArgs;
}
