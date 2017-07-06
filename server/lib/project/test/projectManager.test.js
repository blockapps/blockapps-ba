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

const projectJs = require('../project');
const projectManagerJs = require('../projectManager');
const userManagerJs = require('../../user/userManager');
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
    contract = yield projectManagerJs.uploadContract(admin);
  });

  it('Create Project', function* () {
    const projectArgs = createProjectArgs();

    // create project
    const project = yield projectManagerJs.createProject(admin, contract, projectArgs);
    assert.equal(project.name, projectArgs.name, 'name');
    assert.equal(project.buyer, projectArgs.buyer, 'buyer');
  });

  it('Test exists()', function* () {
    const projectArgs = createProjectArgs();
    // should not exists
    const doesNotExist = yield projectManagerJs.exists(admin, contract, projectArgs.name);
    assert.isDefined(doesNotExist, 'should be defined');
    assert.isNotOk(doesNotExist, 'should not exist');
    // create project
    const project = yield projectManagerJs.createProject(admin, contract, projectArgs);
    // // should exist
    const exists = yield projectManagerJs.exists(admin, contract, projectArgs.name);
    assert.equal(exists, true, 'should exist');
  });

  it('Create Duplicate Project', function* () {
    const projectArgs = createProjectArgs();
    // create project
    const project = yield projectManagerJs.createProject(admin, contract, projectArgs);
    // create a duplicate - should FAIL
    var dupProject;
    try {
      dupProject = yield projectManagerJs.createProject(admin, contract, projectArgs);
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
    yield projectManagerJs.createProject(admin, contract, projectArgs);
    const project = yield projectManagerJs.getProject(admin, contract, projectArgs.name);
    assert.equal(project.name, projectArgs.name, 'should have a name');
  });

  it('Get non exisiting project', function* () {
    const projectArgs = createProjectArgs();
    var nonExistingProject;
    try {
      nonExistingProject = yield projectManagerJs.getProject(admin, contract, projectArgs.name);
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
      const projects = yield projectManagerJs.getProjects(contract);
      const found = projects.filter(function(project) {
        return project.name === projectArgs.name;
      });
      assert.equal(found.length, 0, 'project list should NOT contain ' + projectArgs.name);
    }
    // create project
    yield projectManagerJs.createProject(admin, contract, projectArgs);
    {
      // get projects - should exist
      const projects = yield projectManagerJs.getProjects(contract);
      const found = projects.filter(function(project) {
        return project.name === projectArgs.name;
      });
      assert.equal(found.length, 1, 'project list should contain ' + projectArgs.name);
    }
  });

  it('Get Projects by buyer', function* () {
    const uid = util.uid();

    const mod = 3;
    const count = 2 * mod;
    const projectsArgs = Array.apply(null, {
      length: count
    }).map(function(item, index) {
      const projectArgs = createProjectArgs(uid);
      projectArgs.name += index;
      projectArgs.buyer += index%mod;
      return projectArgs;
    });

    // all create project
    for (let projectArgs of projectsArgs) {
      const project = yield projectManagerJs.createProject(admin, contract, projectArgs);
    }
    // get projects by buyer - should find that name in there
    const buyerName = projectsArgs[0].buyer;
    const projects = yield projectManagerJs.getProjectsByBuyer(contract, buyerName);
    assert.equal(projects.length, count/mod, '# of found projects');
  });

  it('Get Projects by state', function* () {
    const uid = util.uid();

    const count = 8;
    const changed = Math.floor(count/2);
    const projectsArgs = Array.apply(null, {
      length: count
    }).map(function(item, index) {
      const projectArgs = createProjectArgs(uid);
      projectArgs.name += index;
      return projectArgs;
    });

    // all create project
    for (let projectArgs of projectsArgs) {
      yield projectManagerJs.createProject(admin, contract, projectArgs);
    }
    // change state for the first half
    const changedProjectsArgs = projectsArgs.slice(0,changed);
    for (let projectArgs of changedProjectsArgs) {
      const newState = yield projectManagerJs.handleEvent(admin, contract, projectArgs.name, ProjectEvent.ACCEPT);
      assert.equal(newState, ProjectState.PRODUCTION, 'should be in PRODUCTION');
    }

    // get projects by state - should find that name in there
    const projects = yield projectManagerJs.getProjectsByState(contract, ProjectState.PRODUCTION);
    const comparator = function (memberA, memberB) {
      return memberA.name == memberB.name;
    };
    const notContained = util.filter.isContained(changedProjectsArgs, projects, comparator);
    // if found any items in the source list, that are not included in the query results
    assert.equal(notContained.length, 0, 'some projects were not found ' + JSON.stringify(notContained, null, 2));
  });

  it('ACCEPT an OPEN project - change to PRODUCTION', function* () {
    const projectArgs = createProjectArgs(util.uid());
    // create project
    yield projectManagerJs.createProject(admin, contract, projectArgs);
    // set the state
    const newState = yield projectManagerJs.handleEvent(admin, contract, projectArgs.name, ProjectEvent.ACCEPT);
    assert.equal(newState, ProjectState.PRODUCTION, 'handleEvent should return ProjectState.PRODUCTION');
    // check the new state
    const project = (yield rest.waitQuery(`${projectJs.contractName}?name=eq.${projectArgs.name}`, 1))[0];
    assert.equal(parseInt(project.state), ProjectState.PRODUCTION, 'ACCEPTED project should be in PRODUCTION');
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

describe('ProjectManager Life Cycle tests', function() {
  this.timeout(config.timeout);

  var admin;
  var contract;
  // get ready:  admin-user and manager-contract
  before(function* () {
    admin = yield rest.createUser(adminName, adminPassword);
    contract = yield projectManagerJs.uploadContract(admin);
  });

  it('Create new Bid', function* () {
    const supplier = 'Supplier1';
    const amount = 5678;
    const projectArgs = createProjectArgs();

    // create project
    const project = yield projectManagerJs.createProject(admin, contract, projectArgs);
    const bid = yield projectManagerJs.createBid(admin, contract, projectArgs.name, supplier, amount);
    assert.equal(bid.name, projectArgs.name, 'name');
    assert.equal(bid.supplier, supplier, 'supplier');
    assert.equal(bid.amount, amount, 'amount');

    // search by bid id
    const bidId = bid.id;
    {
      const bid = yield projectManagerJs.getBid(bidId);
      assert.equal(bid.name, projectArgs.name, 'name');
      assert.equal(bid.supplier, supplier, 'supplier');
      assert.equal(bid.amount, amount, 'amount');
    }
    // search by project name
    const bids = yield projectManagerJs.getBidsByName(projectArgs.name);
    assert.equal(bids.length, 1, 'one and only one');
  });



});
