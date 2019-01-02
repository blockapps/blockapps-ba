require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest6;
const common = ba.common;
const config = common.config;
const util = common.util;
const assert = common.assert;

const projectManagerJs = require('../projectManager');
const userManagerJs = require('../../user/userManager');
const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;
const BidState = rest.getEnums(`${config.libPath}/bid/contracts/BidState.sol`).BidState;
const UserRole = rest.getEnums(`${config.libPath}/user/contracts/UserRole.sol`).UserRole;

const utils = require('../../../utils');

const userAccessToken1 = process.env.USER_ACCESS_TOKEN_1;
const userAccessToken2 = process.env.USER_ACCESS_TOKEN_2;

describe('ProjectManager Life Cycle tests', function () {
  this.timeout(config.timeout);
  let stratoUser1, stratoUser2;
  let contract;
  let userManagerContract;
  let chainID;

  // get ready:  admin-user and manager-contract
  before(function* () {
    // decode and create new account
    const userEmail1 = utils.getEmailIdFromToken(userAccessToken1);
    stratoUser1 = yield utils.createUser(userAccessToken1, userEmail1);

    // decode and create new account
    const userEmail2 = utils.getEmailIdFromToken(userAccessToken1);
    stratoUser2 = yield utils.createUser(userAccessToken2, userEmail2);

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
          balance: 1000000000000000000000
        },
        {
          address: stratoUser2.address,
          balance: 1000000000000000000000
        }
      ]
    }

    chainID = yield rest.createChain(chain.label, chain.members, chain.balances, chain.src, chain.args);

    contract = yield projectManagerJs.uploadContract(userAccessToken1, {}, chainID);
    userManagerContract = yield userManagerJs.uploadContract(userAccessToken1, {}, chainID);
  });

  it('Create new Bid', function* () {
    const supplier = util.uid('Supplier1');
    const amount = 5678;
    const projectArgs = createProjectArgs();

    // create project
    const project = yield contract.createProject(projectArgs, chainID);
    // create bid
    const bid = yield contract.createBid(project.name, supplier, amount, chainID);
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
    const bids = yield projectManagerJs.getBidsByName(project.name, chainID);
    assert.equal(bids.length, 1, 'one and only one');

    const projects = yield contract.getProjectsBySupplier(supplier, chainID);
    assert.equal(projects.length, 1, 'one and only one');

    const notFound = yield contract.getProjectsBySupplier(supplier + 'z', chainID);
    assert.equal(notFound.length, 0, 'should not find any');
  });

  it('Accept a Bid.', function* () {
    const projectArgs = createProjectArgs();
    const supplier = 'Supplier1';
    const amount = 67;

    // create project
    const project = yield contract.createProject(projectArgs, chainID);
    // create bid
    const bid = yield contract.createBid(project.name, supplier, amount, chainID);
    // check that state is OPEN
    assert.equal(parseInt(bid.state), BidState.OPEN, 'state OPEN');
    // accept the bid
    const results = yield contract.acceptBid(userAccessToken1, bid.id, project.name, chainID);
    // get the bid again
    const newBid = yield projectManagerJs.getBid(bid.id);
    // check that state is ACCEPTED
    assert.equal(parseInt(newBid.state), BidState.ACCEPTED, 'state ACCEPTED');
    // check that query gets it
    const queryBid = yield projectManagerJs.getAcceptedBid(project.name, chainID);
    assert.equal(parseInt(queryBid.state), BidState.ACCEPTED, 'state ACCEPTED');
  });

  it('Accept a Bid - insufficient balance', function* () {
    const projectArgs = createProjectArgs();
    const supplier = 'Supplier1';
    const amount = 1000 + 67; // faucet allowance + more

    // create project
    const project = yield contract.createProject(projectArgs, chainID);
    // create bid
    const bid = yield contract.createBid(project.name, supplier, amount, chainID);
    // check that state is OPEN
    assert.equal(parseInt(bid.state), BidState.OPEN, 'state OPEN');
    // accept the bid
    let errorCode;
    try {
      yield contract.acceptBid(userAccessToken1, bid.id, project.name, chainID);
    } catch (error) {
      errorCode = parseInt(error.message);
    }
    // did not FAIL - that is an error
    assert.isDefined(errorCode, 'accepting a bid with insufficient balance should fail');
    // error should be INSUFFICIENT_BALANCE
    assert.equal(errorCode, ErrorCodes.INSUFFICIENT_BALANCE, 'error should be INSUFFICIENT_BALANCE.');
    // check that none was affected
    const bids = yield projectManagerJs.getBidsByName(project.name, chainID);
    bids.map(bid => {
      assert.equal(bid.state, BidState.OPEN);
    });
  });

  it('Accept a Bid and rejects the others', function* () {
    const uid = util.uid();
    const projectArgs = createProjectArgs(uid);
    const amount = 32;

    // create project
    const project = yield contract.createProject(projectArgs, chainID);
    // create suppliers
    const supplierArgs = createUserArgs(stratoUser1.address, UserRole.SUPPLIER);
    const supplier = yield userManagerContract.createUser(supplierArgs, chainID);
    // create bids
    let bids = yield createRandomBids(project.name, amount, 3, supplier);
    const acceptedBidId = bids[0].id;
    // accept one bid
    const result = yield contract.acceptBid(userAccessToken1, acceptedBidId, projectArgs.name, chainID);
    // get the bids
    bids = yield projectManagerJs.getBidsByName(projectArgs.name, chainID);
    assert.equal(bids.length, 3, 'should have created all bids');
    // check that the accepted bid is ACCEPTED and all others are REJECTED
    bids.map(bid => {
      if (bid.id === acceptedBidId) {
        assert.equal(parseInt(bid.state), BidState.ACCEPTED, 'bid should be ACCEPTED');
      } else {
        assert.equal(parseInt(bid.state), BidState.REJECTED, 'bid should be REJECTED');
      };
    });
  });

  it('Get bids by supplier', function* () {
    const projectArgs = createProjectArgs(util.uid());
    const supplier = 'Supplier1';
    const amount = 5678;

    // create project
    const project = yield contract.createProject(projectArgs, chainID);
    // create bid
    const bid = yield contract.createBid(project.name, supplier, amount, chainID);
    // get bids by supplier
    const bids = yield projectManagerJs.getBidsBySupplier(supplier, chainID);
    const filtered = bids.filter(function (bid) {
      return bid.supplier === supplier && bid.name == projectArgs.name;
    });
    assert.equal(filtered.length, 1, 'one and only one');
  });


  function* createRandomBids(projectName, amount, count, supplier) {
    const bids = [];
    for (let i = 0; i < count; i++) {
      const bid = yield contract.createBid(projectName, supplier.account, amount, chainID);
      bids.push(bid);
    }
    return bids;
  }

});

function createProjectArgs(_uid) {
  const uid = _uid || util.uid();
  const projectArgs = {
    name: 'P_ ?%#@!:* ' + uid.toString().substring(uid.length - 5),
    buyer: 'Buyer_ ?%#@!:* ' + uid,
    description: 'description_ ?%#@!:* ' + uid,
    spec: 'spec_ ?%#@!:* ' + uid,
    price: 234,

    created: new Date().getTime(),
    targetDelivery: new Date().getTime() + 3 * 24 * 60 * 60 * 1000, // 3 days

    addressStreet: 'addressStreet_ ? ' + uid,
    addressCity: 'addressCity_ ? ' + uid,
    addressState: 'addressState_ ? ' + uid,
    addressZip: 'addressZip_ ? ' + uid,
  };

  return projectArgs;
}

// function createUser(address account, UserRole role) returns (ErrorCodes) {
function createUserArgs(account, role) {
  const args = {
    account: account,
    role: role,
  }
  return args;
}