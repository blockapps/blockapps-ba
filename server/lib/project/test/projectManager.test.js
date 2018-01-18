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

  let admin;
  let contract;
  let userManagerContract;
  // get ready:  admin-user and manager-contract
  before(function* () {
    admin = yield rest.createUser(adminName, adminPassword);
    contract = yield projectManagerJs.uploadContract(admin);
    userManagerContract = yield userManagerJs.uploadContract(admin);
  });

  it('Create Project', function* () {
    const projectArgs = createProjectArgs();

    // create project
    const project = yield contract.createProject(projectArgs);
    assert.equal(project.name, projectArgs.name, 'name');
    assert.equal(project.buyer, projectArgs.buyer, 'buyer');
  });

  it('Create Project - illegal name', function* () {
    const projectArgs = createProjectArgs();
    projectArgs.name = '123456789012345678901234567890123';
    let project;
    try {
      // create with illegal name - should fail
      project = yield contract.createProject(projectArgs);
    } catch(error) {
      // error should be ERROR
      const errorCode = error.message;
      assert.equal(errorCode, ErrorCodes.ERROR, `Unexpected error ${JSON.stringify(error,null,2)}`);
    }
    // did not FAIL - that is an error
    assert.isUndefined(project, `Illegal project name was not detected: ${projectArgs.username}`);
  });

  it('Test exists()', function* () {
    const projectArgs = createProjectArgs();
    // should not exists
    const doesNotExist = yield contract.exists(projectArgs.name);
    assert.isDefined(doesNotExist, 'should be defined');
    assert.isNotOk(doesNotExist, 'should not exist');
    // create project
    const project = yield contract.createProject(projectArgs);
    // // should exist
    const exists = yield contract.exists(projectArgs.name);
    assert.equal(exists, true, 'should exist');
  });

  it('Test exists() with special characters', function* () {
    const projectArgs = createProjectArgs();
    projectArgs.name += ' ? # % ! * ';
    // should not exists
    const doesNotExist = yield contract.exists(projectArgs.name);
    assert.isDefined(doesNotExist, 'should be defined');
    assert.isNotOk(doesNotExist, 'should not exist');
    // create project
    const project = yield contract.createProject(projectArgs);
    // // should exist
    const exists = yield contract.exists(projectArgs.name);
    assert.equal(exists, true, 'should exist');
  });

  it('Create Duplicate Project', function* () {
    const projectArgs = createProjectArgs();
    // create project
    const project = yield contract.createProject(projectArgs);
    // create a duplicate - should FAIL
    let dupProject;
    try {
      dupProject = yield contract.createProject(projectArgs);
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
    yield contract.createProject(projectArgs);
    const project = yield contract.getProject(projectArgs.name);
    assert.equal(project.name, projectArgs.name, 'should have a name');
  });

  it('Get non exisiting project', function* () {
    const projectArgs = createProjectArgs();
    let nonExistingProject;
    try {
      nonExistingProject = yield contract.getProject(projectArgs.name);
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
      const projects = yield contract.getProjects();
      const found = projects.filter(function(project) {
        return project.name === projectArgs.name;
      });
      assert.equal(found.length, 0, 'project list should NOT contain ' + projectArgs.name);
    }
    // create project
    yield contract.createProject(projectArgs);
    {
      // get projects - should exist
      const projects = yield contract.getProjects();
      const found = projects.filter(function(project) {
        return project.name === projectArgs.name;
      });
      assert.equal(found.length, 1, 'project list should contain ' + projectArgs.name);
    }
  });

  it.skip('get project leading zeros - load test - skipped', function *() {
    this.timeout(60*60*1000);

    const count = 16*4; // leading 0 once every 16
    const uid = util.uid();
    // create projects
    const projects = [];
    for (let i = 0; i < count; i++) {
      const projectArgs = createProjectArgs(uid);
      projectArgs.name += '_' + i;
      const project = yield contract.createProject(projectArgs);
      projects.push(project);
    }

    // get all projects
    const resultProjects = yield contract.getProjects();
    const comparator = function(projectA, projectB) { return projectA.name == projectB.name; };
    const notFound = util.filter.isContained(projects, resultProjects, comparator, true);
    assert.equal(notFound.length, 0, JSON.stringify(notFound));
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
      const project = yield contract.createProject(projectArgs);
    }
    // get projects by buyer - should find that name in there
    const buyerName = projectsArgs[0].buyer;
    const projects = yield contract.getProjectsByBuyer(buyerName);
    assert.equal(projects.length, count/mod, '# of found projects');
  });

  it('Get Projects by name', function* () {
    const uid = util.uid();

    const count = 3
    const projectsArgs = Array.apply(null, {
      length: count
    }).map(function(item, index) {
      const projectArgs = createProjectArgs(uid);
      projectArgs.name += index;
      return projectArgs;
    });

    // all create project
    for (let projectArgs of projectsArgs) {
      const project = yield contract.createProject(projectArgs);
    }
    // get projects by buyer - should find that name in there
    const names = projectsArgs.map(projectArgs => {
      return projectArgs.name;
    });
    for (let i = projectsArgs.length; i < 539; i++) { // push the csv size boundry
      names.push(projectsArgs[0].name + i);
    }

    const projects = yield contract.getProjectsByName(names);
    assert.equal(projects.length, projectsArgs.length, '# of found projects');
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
      yield contract.createProject(projectArgs);
    }
    // change state for the first half
    const changedProjectsArgs = projectsArgs.slice(0,changed);
    for (let projectArgs of changedProjectsArgs) {
      const newState = yield contract.handleEvent(projectArgs.name, ProjectEvent.ACCEPT);
      assert.equal(newState, ProjectState.PRODUCTION, 'should be in PRODUCTION');
    }

    // get projects by state - should find that name in there
    const projects = yield contract.getProjectsByState(ProjectState.PRODUCTION);
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
    yield contract.createProject(projectArgs);
    // set the state
    const newState = yield contract.handleEvent(projectArgs.name, ProjectEvent.ACCEPT);
    assert.equal(newState, ProjectState.PRODUCTION, 'handleEvent should return ProjectState.PRODUCTION');
    // check the new state
    const project = (yield rest.waitQuery(`${projectJs.contractName}?name=eq.${encodeURIComponent(projectArgs.name)}`, 1))[0];
    assert.equal(parseInt(project.state), ProjectState.PRODUCTION, 'ACCEPTED project should be in PRODUCTION');
  });
});

function createProjectArgs(_uid) {
  const uid = _uid || util.uid();
  const projectArgs = {
    name: 'P_ ?%#@!:* ' + uid.substring(uid.length-5),
    buyer: 'Buyer_ ?%#@!:* ' + uid,
    description: 'description_ ?%#@!:* ' + uid,
    spec: 'spec_ ?%#@!:* ' + uid,
    price: 234,

    created: new Date().getTime(),
    targetDelivery: new Date().getTime() + 3 * 24*60*60*1000, // 3 days

    addressStreet: 'addressStreet_ ? ' + uid,
    addressCity: 'addressCity_ ? ' + uid,
    addressState: 'addressState_ ? ' + uid,
    addressZip: 'addressZip_ ? ' + uid,
  };

  return projectArgs;
}

describe('ProjectManager Life Cycle tests', function() {
  this.timeout(config.timeout);

  let admin;
  let contract;
  let userManagerContract;

  // get ready:  admin-user and manager-contract
  before(function* () {
    admin = yield rest.createUser(adminName, adminPassword);
    contract = yield projectManagerJs.uploadContract(admin);
    userManagerContract = yield userManagerJs.uploadContract(admin);
  });

  it('Create new Bid', function* () {
    const supplier = util.uid('Supplier1');
    const amount = 5678;
    const projectArgs = createProjectArgs();

    // create project
    const project = yield contract.createProject(projectArgs);
    // create bid
    const bid = yield contract.createBid(project.name, supplier, amount);
    assert.equal(bid.name, project.name, 'name');
    assert.equal(bid.supplier, supplier, 'supplier');
    assert.equal(bid.amount, amount, 'amount');

    // search by bid id
    const bidId = bid.id;
    {
      const bid = yield projectManagerJs.getBid(bidId);
      assert.equal(bid.name, project.name, 'name');
      assert.equal(bid.supplier, supplier, 'supplier');
      assert.equal(bid.amount, amount, 'amount');
    }
    // search by project name
    const bids = yield projectManagerJs.getBidsByName(project.name);
    assert.equal(bids.length, 1, 'one and only one');

    const projects = yield contract.getProjectsBySupplier(supplier);
    assert.equal(projects.length, 1, 'one and only one');

    const notFound = yield contract.getProjectsBySupplier(supplier+'z');
    assert.equal(notFound.length, 0, 'should not find any');
  });

  it('Accept a Bid.', function* () {
    const projectArgs = createProjectArgs();
    const supplier = 'Supplier1';
    const amount = 67;

    // create project
    const project = yield contract.createProject(projectArgs);
    // create bid
    const bid = yield contract.createBid(project.name, supplier, amount);
    // check that state is OPEN
    assert.equal(parseInt(bid.state), BidState.OPEN, 'state OPEN');
    // accept the bid
    const buyer = { // pretend the admin is the buyer
      username: admin.name,
      password: admin.password,
      account: admin.address,
    }
    const results = yield contract.acceptBid(buyer, bid.id, project.name);
    // get the bid again
    const newBid = yield projectManagerJs.getBid(bid.id);
    // check that state is ACCEPTED
    assert.equal(parseInt(newBid.state), BidState.ACCEPTED, 'state ACCEPTED');
    // check that query gets it
    const queryBid = yield projectManagerJs.getAcceptedBid(project.name);
    assert.equal(parseInt(queryBid.state), BidState.ACCEPTED, 'state ACCEPTED');
  });

  it('Accept a Bid - insufficient balance', function* () {
    const projectArgs = createProjectArgs();
    const supplier = 'Supplier1';
    const amount = 1000 + 67; // faucet allowance + more

    // create project
    const project = yield contract.createProject(projectArgs);
    // create bid
    const bid = yield contract.createBid(project.name, supplier, amount);
    // check that state is OPEN
    assert.equal(parseInt(bid.state), BidState.OPEN, 'state OPEN');
    // accept the bid
    const buyer = { // pretend the admin is the buyer
      username: admin.name,
      password: admin.password,
      account: admin.address,
    }
    let errorCode;
    try {
      yield contract.acceptBid(buyer, bid.id, project.name);
    } catch(error) {
      errorCode = parseInt(error.message);
    }
    // did not FAIL - that is an error
    assert.isDefined(errorCode, 'accepting a bid with insufficient balance should fail');
    // error should be INSUFFICIENT_BALANCE
    assert.equal(errorCode, ErrorCodes.INSUFFICIENT_BALANCE, 'error should be INSUFFICIENT_BALANCE.');
    // check that none was affected
    const bids = yield projectManagerJs.getBidsByName(project.name);
    bids.map(bid => {
      assert.equal(bid.state, BidState.OPEN);
    });
  });

  it('Accept a Bid and rejects the others', function* () {
    const uid = util.uid();
    const projectArgs = createProjectArgs(uid);
    const password = '1234';
    const amount = 32;

    // create project
    const project = yield contract.createProject(projectArgs);
    // create suppliers
    const suppliers = yield createSuppliers(3, password, uid);
    // create bids
    let bids = yield createMultipleBids(projectArgs.name, suppliers, amount);
    // accept one bid
    const buyer = { // pretend the admin is the buyer
      username: admin.name,
      password: admin.password,
      account: admin.address,
    }
    const acceptedBidId = bids[0].id;
    const result = yield contract.acceptBid(buyer, acceptedBidId, projectArgs.name);
    // get the bids
    bids = yield projectManagerJs.getBidsByName(projectArgs.name);
    assert.equal(bids.length, suppliers.length, 'should have created all bids');
    // check that the accepted bid is ACCEPTED and all others are REJECTED
    bids.map(bid => {
      if (bid.id === acceptedBidId) {
        assert.equal(parseInt(bid.state), BidState.ACCEPTED, 'bid should be ACCEPTED');
      } else {
        assert.equal(parseInt(bid.state), BidState.REJECTED, 'bid should be REJECTED');
      };
    });
  });

  function* createMultipleBids(projectName, suppliers, amount) {
    const bids = [];
    for (let supplier of suppliers) {
      const bid = yield contract.createBid(projectName, supplier.username, amount);
      bids.push(bid);
    }
    return bids;
  }

  it('Get bids by supplier', function* () {
    const projectArgs = createProjectArgs(util.uid());
    const supplier = 'Supplier1';
    const amount = 5678;

    // create project
    const project = yield contract.createProject(projectArgs);
    // create bid
    const bid = yield contract.createBid(project.name, supplier, amount);
    // get bids by supplier
    const bids = yield projectManagerJs.getBidsBySupplier(supplier);
    const filtered = bids.filter(function(bid) {
      return bid.supplier === supplier  &&  bid.name == projectArgs.name;
    });
    assert.equal(filtered.length, 1, 'one and only one');
  });

  it.skip('Accept a Bid (send funds into accepted bid), rejects the others, receive project, settle (send bid funds to supplier)', function* () {
    const uid = util.uid();
    const projectArgs = createProjectArgs(uid);
    const password = '1234';
    const amount = 23;
    const amountWei = new BigNumber(amount).times(constants.ETHER);
    const FAUCET_AWARD = new BigNumber(1000).times(constants.ETHER) ;
    const GAS_LIMIT = new BigNumber(100000000); // default in bockapps-rest

    // create buyer and suppliers
    const buyerArgs = createUserArgs(projectArgs.buyer, password, UserRole.BUYER);
    const buyer = yield userManagerContract.createUser(buyerArgs);
    buyer.password = password; // IRL this will be a prompt to the buyer
    // create suppliers
    const suppliers = yield createSuppliers(3, password, uid);

    // create project
    const project = yield contract.createProject(projectArgs);
    // create bids
    const createdBids = yield createMultipleBids(projectArgs.name, suppliers, amount);
    { // test
      const bids = yield projectManagerJs.getBidsByName(projectArgs.name);
      assert.equal(createdBids.length, bids.length, 'should find all the created bids');
    }
    // get the buyers balance before accepting a bid
    buyer.initialBalance = yield userManagerContract.getBalance(buyer.username);
    buyer.initialBalance.should.be.bignumber.eq(FAUCET_AWARD);
    // accept one bid (the first)
    const acceptedBid = createdBids[0];
    yield contract.acceptBid(buyer, acceptedBid.id, projectArgs.name);
    // get the buyers balance after accepting a bid
    buyer.balance = yield userManagerContract.getBalance(buyer.username);
    const delta = buyer.initialBalance.minus(buyer.balance);
    delta.should.be.bignumber.gte(amountWei); // amount + fee
    delta.should.be.bignumber.lte(amountWei.plus(GAS_LIMIT)); // amount + max fee (gas-limit)
    // get the bids
    const bids = yield projectManagerJs.getBidsByName(projectArgs.name);
    // check that the expected bid is ACCEPTED and all others are REJECTED
    bids.map(bid => {
      if (bid.id === acceptedBid.id) {
        assert.equal(parseInt(bid.state), BidState.ACCEPTED, 'bid should be ACCEPTED');
      } else {
        assert.equal(parseInt(bid.state), BidState.REJECTED, 'bid should be REJECTED');
      };
    });
    // deliver the project
    const projectState = yield contract.handleEvent(projectArgs.name, ProjectEvent.DELIVER);
    assert.equal(projectState, ProjectState.INTRANSIT, 'delivered project should be INTRANSIT ');
    // receive the project
    yield receiveProject(projectArgs.name);

    // get the suppliers balances
    for (let supplier of suppliers) {
      supplier.balance = yield userManagerContract.getBalance(supplier.username);
      if (supplier.username == acceptedBid.supplier) {
        // the winning supplier should have the bid amount minus the tx fee
        const delta = supplier.balance.minus(FAUCET_AWARD);
        const fee = new BigNumber(10000000);
        delta.should.be.bignumber.eq(amountWei.minus(fee));
      } else {
        // everyone else should have the otiginal value
        supplier.balance.should.be.bignumber.eq(FAUCET_AWARD);
      }
    }
  });

  function* createSuppliers(count, password, uid) {
    const suppliers = [];
    for (let i = 0 ; i < count; i++) {
      const name = `Supplier${i}_${uid}`;
      const supplierArgs = createUserArgs(name, password, UserRole.SUPPLIER);
      const supplier = yield userManagerContract.createUser(supplierArgs);
      suppliers.push(supplier);
    }
    return suppliers;
  }

  // throws: ErrorCodes
  function* receiveProject(projectName) {
    rest.verbose('receiveProject', projectName);
    // get the accepted bid
    const bid = yield projectManagerJs.getAcceptedBid(projectName);
    // get the supplier for the accepted bid
    const supplier = yield userManagerContract.getUser(bid.supplier);
    // Settle the project:  change state to RECEIVED and tell the bid to send the funds to the supplier
    yield contract.settleProject(projectName, supplier.account, bid.address);
  }

});

// function createUser(address account, string username, bytes32 pwHash, UserRole role) returns (ErrorCodes) {
function createUserArgs(name, password, role) {
  const args = {
    username: name,
    password: password,
    role: role,
  }
  return args;
}
