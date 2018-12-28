require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest6;
const common = ba.common;
const config = common.config;
const util = common.util;
const assert = common.assert;

const projectJs = require('../project');
const projectManagerJs = require('../projectManager');
const userManagerJs = require('../../user/userManager');
const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;
const ProjectState = rest.getEnums(`${config.libPath}/project/contracts/ProjectState.sol`).ProjectState;
const ProjectEvent = rest.getEnums(`${config.libPath}/project/contracts/ProjectEvent.sol`).ProjectEvent;
const BidState = rest.getEnums(`${config.libPath}/bid/contracts/BidState.sol`).BidState;
const UserRole = rest.getEnums(`${config.libPath}/user/contracts/UserRole.sol`).UserRole;

const jwtDecode = require('jwt-decode');
const utils = require('../../../utils');

const accessToken = process.env.ADMIN_TOKEN;
const token2 = process.env.ADMIN_TOKEN1;

describe('ProjectManager tests', function () {
  this.timeout(config.timeout);

  let stratoUser1, stratoUser2;
  let contract;
  let userManagerContract;
  let chainID;
  // get ready:  admin-user and manager-contract
  before(function* () {
    // decode and create new account
    const decodedToken = jwtDecode(accessToken);
    const userEmail = decodedToken['email'];
    stratoUser1 = yield utils.createUser(accessToken, userEmail);

    // decode and create new account
    const decodedToken1 = jwtDecode(token2);
    const userEmail1 = decodedToken1['email'];
    stratoUser2 = yield utils.createUser(token2, userEmail1);

    const chain = {
      label: 'test airline',
      src: 'contract Governance { }',
      args: {},
      members: [
        {
          address: stratoUser1.address,
          enode: "enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303?discport=30303"
        },
        {
          address: stratoUser2.address,
          enode: "enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303?discport=30303"
        }
      ],
      balances: [
        {
          address: stratoUser1.address,
          balance: 100000000000000000000000000000000000000
        },
        {
          address: stratoUser2.address,
          balance: 100000000000000000000000000000000000000
        }
      ]
    }

    chainID = yield rest.createChain(chain.label, chain.members, chain.balances, chain.src, chain.args);

    contract = yield projectManagerJs.uploadContract(accessToken, {}, chainID);
    userManagerContract = yield userManagerJs.uploadContract(accessToken, {}, chainID);
  });

  it('Create Project', function* () {
    const projectArgs = createProjectArgs();

    // create project
    const project = yield contract.createProject(projectArgs, chainID);
    assert.equal(project.name, projectArgs.name, 'name');
    assert.equal(project.buyer, projectArgs.buyer, 'buyer');
  });

  it('Create Project - illegal name', function* () {
    const projectArgs = createProjectArgs();
    projectArgs.name = '123456789012345678901234567890123';
    let project;
    try {
      // create with illegal name - should fail
      project = yield contract.createProject(projectArgs, chainID);
    } catch (error) {
      // error should be ERROR
      const errorCode = error.message;
      assert.equal(errorCode, ErrorCodes.ERROR, `Unexpected error ${JSON.stringify(error, null, 2)}`);
    }
    // did not FAIL - that is an error
    assert.isUndefined(project, `Illegal project name was not detected: ${projectArgs.username}`);
  });

  it('Test exists()', function* () {
    const projectArgs = createProjectArgs();
    // should not exists
    const doesNotExist = yield contract.exists(projectArgs.name, chainID);
    assert.isDefined(doesNotExist, 'should be defined');
    assert.isNotOk(doesNotExist, 'should not exist');
    // create project
    const project = yield contract.createProject(projectArgs, chainID);
    // should exist
    const exists = yield contract.exists(projectArgs.name, chainID);
    assert.equal(exists, true, 'should exist');
  });

  it('Test exists() with special characters', function* () {
    const projectArgs = createProjectArgs();
    projectArgs.name += ' ? # % ! * ';
    // should not exists
    const doesNotExist = yield contract.exists(projectArgs.name, chainID);
    assert.isDefined(doesNotExist, 'should be defined');
    assert.isNotOk(doesNotExist, 'should not exist');
    // create project
    const project = yield contract.createProject(projectArgs, chainID);
    // // should exist
    const exists = yield contract.exists(projectArgs.name, chainID);
    assert.equal(exists, true, 'should exist');
  });

  it('Create Duplicate Project', function* () {
    const projectArgs = createProjectArgs();
    // create project
    const project = yield contract.createProject(projectArgs, chainID);
    // create a duplicate - should FAIL
    let dupProject;
    try {
      dupProject = yield contract.createProject(projectArgs, chainID);
    } catch (error) {
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
    yield contract.createProject(projectArgs, chainID);
    const project = yield contract.getProject(projectArgs.name, chainID);
    assert.equal(project.name, projectArgs.name, 'should have a name');
  });

  it('Get non exisiting project', function* () {
    const projectArgs = createProjectArgs();
    let nonExistingProject;
    try {
      nonExistingProject = yield contract.getProject(projectArgs.name, chainID);
    } catch (error) {
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
      const projects = yield contract.getProjects(chainID);
      const found = projects.filter(function (project) {
        return project.name === projectArgs.name;
      });
      assert.equal(found.length, 0, 'project list should NOT contain ' + projectArgs.name);
    }
    // create project
    yield contract.createProject(projectArgs, chainID);
    {
      // get projects - should exist
      const projects = yield contract.getProjects(chainID);
      const found = projects.filter(function (project) {
        return project.name === projectArgs.name;
      });
      assert.equal(found.length, 1, 'project list should contain ' + projectArgs.name);
    }
  });

  it.skip('get project leading zeros - load test - skipped', function* () {
    this.timeout(60 * 60 * 1000);

    const count = 16 * 4; // leading 0 once every 16
    const uid = util.uid();
    // create projects
    const projects = [];
    for (let i = 0; i < count; i++) {
      const projectArgs = createProjectArgs(uid);
      projectArgs.name += '_' + i;
      const project = yield contract.createProject(projectArgs, chainID);
      projects.push(project);
    }

    // get all projects
    const resultProjects = yield contract.getProjects(chainID);
    const comparator = function (projectA, projectB) { return projectA.name == projectB.name; };
    const notFound = util.filter.isContained(projects, resultProjects, comparator, true);
    assert.equal(notFound.length, 0, JSON.stringify(notFound));
  });


  it('Get Projects by buyer', function* () {
    const uid = util.uid();

    const mod = 3;
    const count = 2 * mod;
    const projectsArgs = Array.apply(null, {
      length: count
    }).map(function (item, index) {
      const projectArgs = createProjectArgs(uid);
      projectArgs.name += index;
      projectArgs.buyer += index % mod;
      return projectArgs;
    });

    // all create project
    for (let projectArgs of projectsArgs) {
      const project = yield contract.createProject(projectArgs, chainID);
    }
    // get projects by buyer - should find that name in there
    const buyerName = projectsArgs[0].buyer;
    const projects = yield contract.getProjectsByBuyer(buyerName, chainID);
    assert.equal(projects.length, count / mod, '# of found projects');
  });

  it('Get Projects by name', function* () {
    const uid = util.uid();

    const count = 3
    const projectsArgs = Array.apply(null, {
      length: count
    }).map(function (item, index) {
      const projectArgs = createProjectArgs(uid);
      projectArgs.name += index;
      return projectArgs;
    });

    // all create project
    for (let projectArgs of projectsArgs) {
      const project = yield contract.createProject(projectArgs, chainID);
    }
    // get projects by buyer - should find that name in there
    const names = projectsArgs.map(projectArgs => {
      return projectArgs.name;
    });
    for (let i = projectsArgs.length; i < 539; i++) { // push the csv size boundry
      names.push(projectsArgs[0].name + i);
    }

    const projects = yield contract.getProjectsByName(names, chainID);
    assert.equal(projects.length, projectsArgs.length, '# of found projects');
  });

  it('Get Projects by state', function* () {
    const uid = util.uid();

    const count = 8;
    const changed = Math.floor(count / 2);
    const projectsArgs = Array.apply(null, {
      length: count
    }).map(function (item, index) {
      const projectArgs = createProjectArgs(uid);
      projectArgs.name += index;
      return projectArgs;
    });

    // all create project
    for (let projectArgs of projectsArgs) {
      yield contract.createProject(projectArgs, chainID);
    }
    // change state for the first half
    const changedProjectsArgs = projectsArgs.slice(0, changed);
    for (let projectArgs of changedProjectsArgs) {
      const newState = yield contract.handleEvent(projectArgs.name, ProjectEvent.ACCEPT, chainID);
      assert.equal(newState, ProjectState.PRODUCTION, 'should be in PRODUCTION');
    }

    // get projects by state - should find that name in there
    const projects = yield contract.getProjectsByState(ProjectState.PRODUCTION, chainID);
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
    yield contract.createProject(projectArgs, chainID);
    // set the state
    const newState = yield contract.handleEvent(projectArgs.name, ProjectEvent.ACCEPT, chainID);
    assert.equal(newState, ProjectState.PRODUCTION, 'handleEvent should return ProjectState.PRODUCTION');
    // check the new state
    const project = yield contract.getProject(projectArgs.name, chainID);
    assert.equal(parseInt(project.state), ProjectState.PRODUCTION, 'ACCEPTED project should be in PRODUCTION');
  });
});
