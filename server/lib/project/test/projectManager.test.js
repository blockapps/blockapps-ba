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

  const scope = {};

  // get ready:  admin-user and manager-contract
  before(function (done) {
    rest.setScope(scope)
      // create admin
      .then(rest.createUser(adminName, adminPassword))
      // upload ProjectManager
      .then(projectManager.uploadContract(adminName, adminPassword))
      // upload UserManager
      .then(userManager.uploadContract(adminName, adminPassword))
      .then(function (scope) {
        done();
      }).catch(done);
  });

  it('Create Project', function(done) {
    const projectArgs = createProjectArgs(util.uid());

    rest.setScope(scope)
      // create user
      .then(projectManager.createProject(adminName, projectArgs))
      // returns the record from search
      .then(function(scope) {
        const project = scope.result;
        assert.equal(project.name, projectArgs.name, 'name');
        assert.equal(project.buyer, projectArgs.buyer, 'buyer');
        return scope;
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });

  it('Test exists()', function(done) {
    const projectArgs = createProjectArgs(util.uid());

    rest.setScope(scope)
      // should not exists
      .then(projectManager.exists(adminName, projectArgs.name))
      .then(function(scope) {
        const exists = scope.result;
        assert.isDefined(exists, 'should be defined');
        assert.isNotOk(exists, 'should not exist');
        return scope;
      })
      // create user
      .then(projectManager.createProject(adminName, projectArgs))
      // should exist
      .then(projectManager.exists(adminName, projectArgs.name))
      .then(function(scope) {
        const exists = scope.result;
        assert.equal(exists, true, 'should exist')
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });

  it('Create Duplicate Project', function(done) {
    const projectArgs = createProjectArgs(util.uid());

    scope.error = undefined;

    rest.setScope(scope)
      // create project
      .then(projectManager.createProject(adminName, projectArgs))
      .then(function(scope) {
        // create a duplicate - should FAIL
        return rest.setScope(scope)
          .then(projectManager.createProject(adminName, projectArgs))
          .then(function(scope) {
            // did not FAIL - that is an error
            scope.error = 'Duplicate project-name was not detected: ' + projectArgs.name;
            return scope
          })
          .catch(function(error) {
            const errorCode = error.message;
            // error should be EXISTS
            if (errorCode == ErrorCodes.EXISTS) {
              return scope;
            }
            // different error thrown - not good
            scope.error = 'projectManager.createProject: threw: ' + errorCode;
            return scope
          });
      })
      .then(function(scope) {
        // check error for the previous step
        if (scope.error !== undefined)
          throw(new Error(scope.error));
        // all good
        return scope;
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });

  it('Get Project', function(done) {
    const projectArgs = createProjectArgs(util.uid());

    rest.setScope(scope)
      // create project
      .then(projectManager.createProject(adminName, projectArgs))
      // get it - should exist
      .then(projectManager.getProject(adminName, projectArgs.name))
      .then(function(scope) {
        const project = scope.result;
        assert.equal(project.name, projectArgs.name, 'should have a name');
        return scope;
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });

  it('Get non exisiting project', function(done) {
    const projectArgs = createProjectArgs(util.uid());

    rest.setScope(scope)
      // get project - should not exist
      .then(projectManager.getProject(adminName, projectArgs.name))
      .then(function(scope) {
        // did not throw - not good
        done(new Error('Project should nto be found ' + projectArgs.name));
      }).catch(function(error) {
        const errorCode = error.message;
        // error should be NOT_FOUND
        if (errorCode == ErrorCodes.NOT_FOUND) {
          done();
          return ;
        }
        // other error - not good
        done(error);
      });
  });

  it('Get Projects', function(done) {
    const projectArgs = createProjectArgs(util.uid());

    rest.setScope(scope)
      // get projects - should not exist
      .then(projectManager.getProjects())
      .then(function(scope) {
        const projects = scope.result;
        const found = projects.filter(function(project) {
          return project.name === projectArgs.name;
        });
        assert.equal(found.length, 0, 'project list should NOT contain ' + projectArgs.name);
        return scope;
      })
      // create project
      .then(projectManager.createProject(adminName, projectArgs))
      // get projects - should exist
      .then(projectManager.getProjects(adminName))
      .then(function(scope) {
        const projects = scope.result;
        const found = projects.filter(function(project) {
          return project.name === projectArgs.name;
        });
        assert.equal(found.length, 1, 'project list should contain ' + projectArgs.name);
        return scope;
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });

  it('Get Projects by buyer', function(done) {
    const uid = util.uid();

    const count = 15;
    const mod = 3;
    const projects = Array.apply(null, {
      length: count
    }).map(function(item, index) {
      const projectArgs = createProjectArgs(uid);
      projectArgs.name += index;
      projectArgs.buyer += index%mod;
      return projectArgs;
    });

    rest.setScope(scope)
      // add all projects
      .then(function(scope) {
        return Promise.each(projects, function(projectArgs) { // for each project
          return projectManager.createProject(adminName, projectArgs)(scope) // create project
        }).then(function() { // all done
          return scope;
        });
      })
      // get projects by buyer - should find that name in there
      .then(projectManager.getProjectsByBuyer(projects[0].buyer))
      .then(function(scope) {
        const projects = scope.result;
        assert.equal(projects.length, count/mod, '# of found projects');
        return scope;
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });

  it('Get Projects by state', function(done) {
    const uid = util.uid();

    const count = 8;
    const changed = Math.floor(count/2);
    const sourceProjects = Array.apply(null, {
      length: count
    }).map(function(item, index) {
      const projectArgs = createProjectArgs(uid);
      projectArgs.name += index;
      return projectArgs;
    });

    rest.setScope(scope)
      // add all projects
      .then(function(scope) {
        return Promise.each(sourceProjects, function(projectArgs) { // for each project
          return projectManager.createProject(adminName, projectArgs)(scope) // create project
        }).then(function() { // all done
          return scope;
        });
      })
      // change state for the first half
      .then(function(scope) {
        return Promise.each(sourceProjects.slice(0,changed), function(project) { // for each project
          return projectManager.handleEvent(adminName, project.name, ProjectEvent.ACCEPT)(scope);
        }).then(function() { // all done
          return scope;
        });
      })

      // get projects by state - should find that name in there
      .then(projectManager.getProjectsByState(ProjectState.PRODUCTION))
      .then(function(scope) {
        const projects = scope.result;
        const comparator = function (memberA, memberB) {
          return memberA.name == memberB.name;
        };
        const notContained = util.filter.isContained(sourceProjects.slice(0,changed), projects, comparator, true);
        // if found any items in the source list, that are not included in the query results
        assert.equal(notContained.length, 0, 'some projects were not found ' + JSON.stringify(notContained, null, 2));
        return scope;
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });

  it('ACCEPT an OPEN project - change to PRODUCTION', function(done) {
    const projectArgs = createProjectArgs(util.uid());

    rest.setScope(scope)
      // create a project
      .then(projectManager.createProject(adminName, projectArgs))
      .then(function(scope) {
        const project = scope.result;
        assert.equal(project.name, projectArgs.name, 'name');
        return scope;
      })
      // set the state
      .then(projectManager.handleEvent(adminName, projectArgs.name, ProjectEvent.ACCEPT))
      .then(function(scope) {
        const result = scope.result;
        assert.equal(result.errorCode, ErrorCodes.SUCCESS, 'handleEvent should return ErrorCodes.SUCCESS');
        assert.equal(result.state, ProjectState.PRODUCTION, 'handleEvent should return ProjectState.PRODUCTION');
        return scope;
      })
      // check the new state
      .then(rest.waitQuery(`${project.contractName}?name=eq.${projectArgs.name}`, 1))
      .then(function(scope) {
        const resultsArray = scope.query.slice(-1)[0];
        assert.equal(resultsArray.length, 1, 'one and only one');
        const project = resultsArray[0];
        assert.equal(project.state, ProjectState[ProjectState.PRODUCTION], 'ACCEPTED project should be in PRODUCTION');
        return scope;
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });

  function createProjectArgs(uid) {
    const projectArgs = {
      name: 'Project_' + uid,
      buyer: 'Buyer1',
      description: 'description_' + uid,
      spec: 'spec_' + uid,
      price: 1234,

      created: new Date().getTime(),
      targetDelivery: new Date().getTime() + 3 * 24*60*60*1000, // 3 days

      addressStreet: 'addressStreet_' + uid,
      addressCity: 'addressCity_' + uid,
      addressState: 'addressState_' + uid,
      addressZip: 'addressZip_' + uid,
    };

    return projectArgs;
  }

  it('Create new Bid', function(done) {
    const supplier = 'Supplier1';
    const amount = 5678;
    const uid = util.uid();
    const projectArgs = createProjectArgs(uid);

    rest.setScope(scope)
      // create user
      .then(projectManager.createProject(adminName, projectArgs))
      .then(projectManager.createBid(adminName, projectArgs.name, supplier, amount))
      // returns the record from search
      .then(function(scope) {
        const bid = scope.result;
        assert.equal(bid.name, projectArgs.name, 'name');
        assert.equal(bid.supplier, supplier, 'supplier');
        assert.equal(bid.amount, amount, 'amount');
        return scope;
      })
      // search by bid id
      .then(function(scope) {
        const bid = scope.result;
        return projectManager.getBid(bid.id)(scope)
          .then(function(scope) {
            const bid = scope.result;
            assert.equal(bid.name, projectArgs.name, 'name');
            assert.equal(bid.supplier, supplier, 'supplier');
            assert.equal(bid.amount, amount, 'amount');
            return scope;
          });
      })
      // search by project name
      .then(projectManager.getBidsByName(projectArgs.name))
      .then(function(scope) {
        const bids = scope.result;
        assert.equal(bids.length, 1, 'one and only one');
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });

  it('Accept a Bid', function(done) {
    const projectArgs = createProjectArgs(util.uid());
    const supplier = 'Supplier1';
    const amount = 5678;

    rest.setScope(scope)
      // create project
      .then(projectManager.createProject(adminName, projectArgs))
      // create a bid
      .then(projectManager.createBid(adminName, projectArgs.name, supplier, amount))
      // save the bid ID
      .then(function(scope) {
        const bid = scope.result;
        scope.bidId = bid.id;
        return scope;
      })
      // get the bid
      .then(function(scope) {
        return projectManager.getBid(scope.bidId)(scope)
      })
      // check that state is OPEN
      .then(function(scope) {
        const bid = scope.result;
        assert.equal(bid.state, BidState[BidState.OPEN], 'state OPEN');
        return scope;
      })
      // accept the bid
      .then(function(scope) {
        return projectManager.acceptBid(adminName, scope.bidId, projectArgs.name)(scope);
      })
      // get the bid again
      .then(function(scope) {
        return projectManager.getBid(scope.bidId)(scope);
      })
      // check that state is ACCEPTED
      .then(function(scope) {
        const bid = scope.result;
        assert.equal(bid.state, BidState[BidState.ACCEPTED], 'state ACCEPTED');
        return scope;
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });

  it('Accept a Bid and rejects the others', function(done) {
    const projectArgs = createProjectArgs(util.uid());
    const suppliers = ['Supplier1', 'Supplier2', 'Supplier3'];
    const amount = 32;

    rest.setScope(scope)
      // create project
      .then(projectManager.createProject(adminName, projectArgs))
      // create bids
      .then(createMultipleBids(adminName, projectArgs.name, suppliers, amount))
      .then(projectManager.getBidsByName(projectArgs.name))
      // accept one bid
      .then(function(scope) {
        const bids = scope.result;
        scope.acceptedBid = bids[0].id;
        return projectManager.acceptBid(adminName, bids[0].id, projectArgs.name)(scope);
      })
      // get the bids
      .then(function(scope) {
        return projectManager.getBidsByName(projectArgs.name)(scope);
      })
      // check that the accepted bid is ACCEPTED and all others are REJECTED
      .then(function(scope) {
        const bids = scope.result;
        console.log(bids);
        bids.map(function(bid) {
          if (bid.id === scope.acceptedBid) {
            assert.equal(bid.state, BidState[BidState.ACCEPTED]);
          } else {
            assert.equal(bid.state, BidState[BidState.REJECTED]);
          }
        });
        return scope;
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });

  function createMultipleBids(adminName, name, suppliers, amount) {
    return function(scope) {
      return Promise.each(suppliers, function(supplier) { // for each project
        return projectManager.createBid(adminName, name, supplier, amount)(scope); // create project
      }).then(function() { // all done
        return scope;
      });
    }
  }

  it('Get bids by supplier', function(done) {
    const projectArgs = createProjectArgs(util.uid());
    const supplier = 'Supplier1';
    const amount = 5678;

    rest.setScope(scope)
      // create user
      .then(projectManager.createProject(adminName, projectArgs))
      .then(projectManager.createBid(adminName, projectArgs.name, supplier, amount))
      // get bids by supplier
      .then(projectManager.getBidsBySupplier(supplier))
      .then(function(scope) {
        const bids = scope.result;
        const filtered = bids.filter(function(bid) {
          return bid.supplier === supplier  &&  bid.name == projectArgs.name;
        });
        assert.equal(filtered.length, 1, 'one and only one');
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });

  it('Accept a Bid, rejects the others, receive project', function(done) {
    const uid = util.uid();
    const projectArgs = createProjectArgs(uid);
    const suppliers = ['Supplier1_' + uid, 'Supplier2_' + uid, 'Supplier3_' + uid];
    const password = '1234';
    const role = UserRole.SUPPLIER;
    const amount = 5678;

    rest.setScope(scope)
      // create the users
      .then(userManager.createUser(adminName, projectArgs.buyer, password, role))
      .then(userManager.createUser(adminName, suppliers[0], password, role))
      .then(userManager.createUser(adminName, suppliers[1], password, role))
      .then(userManager.createUser(adminName, suppliers[2], password, role))
      // create project
      .then(projectManager.createProject(adminName, projectArgs))
      // create bids
      .then(createMultipleBids(adminName, projectArgs.name, suppliers, amount))
      .then(projectManager.getBidsByName(projectArgs.name))
      // accept one bid
      .then(function(scope) {
        const bids = scope.result;
        scope.acceptedBid = bids[0].id; // accept bid 0
        return projectManager.acceptBid(adminName, scope.acceptedBid, projectArgs.name)(scope);
      })
      // get all the bids for this project
      .then(function(scope) {
        return projectManager.getBidsByName(projectArgs.name)(scope);
      })
      // check that the accepted bid is ACCEPTED and all others are REJECTED
      .then(function(scope) {
        const bids = scope.result;
        bids.map(function(bid) {
          if (bid.id === scope.acceptedBid) {
            assert.equal(bid.state, BidState[BidState.ACCEPTED]);
          } else {
            assert.equal(bid.state, BidState[BidState.REJECTED]);
          }
        });
        return scope;
      })
      // deliver the project
      .then(projectManager.handleEvent(adminName, projectArgs.name, ProjectEvent.DELIVER))
      // receive the project
      .then(receiveProject(adminName, projectArgs.name, password))
      .then(function(scope) {
        done();
      }).catch(done);
  });

  it.only('Accept a Bid, rejects the others, send funds into accepted bid', function(done) {
    const uid = util.uid();
    const projectArgs = createProjectArgs(uid);
    const suppliers = ['Supplier1_' + uid, 'Supplier2_' + uid, 'Supplier3_' + uid];
    const password = '1234';
    const amount = 23;

    rest.setScope(scope)
      // create the users
      .then(userManager.createUser(adminName, projectArgs.buyer, password, UserRole.BUYER))
      .then(userManager.createUser(adminName, suppliers[0], password, UserRole.SUPPLIER))
      // .then(userManager.createUser(adminName, suppliers[1], password, UserRole.SUPPLIER))
      // .then(userManager.createUser(adminName, suppliers[2], password, UserRole.SUPPLIER))
      // create project
      .then(projectManager.createProject(adminName, projectArgs))
      // create bids
      .then(createMultipleBids(adminName, projectArgs.name, suppliers, amount))
      .then(projectManager.getBidsByName(projectArgs.name))
      // accept one bid
      .then(function(scope) {
        const bids = scope.result;
        scope.acceptedBid = bids[0]; // accept bid 0
        return projectManager.acceptBid(projectArgs.buyer, scope.acceptedBid.id, projectArgs.name)(scope);
      })
      .then(userManager.getBalance(adminName, projectArgs.buyer))
      .then(function(scope) {
        const balanceWei = scope.result; // in WEI
        const balance = new BigNumber(balanceWei).div(constants.ETHER);
        const initialBalance = new BigNumber(1000) ; // faucet award
        const bidAmount = new BigNumber(scope.acceptedBid.amount);

        const gasPrice = new BigNumber('50000000000');
        const gasLimit = new BigNumber('21000');
        const fee = new BigNumber(gasLimit).times(new BigNumber(gasPrice)).div(constants.ETHER);

        const expectedBalance = new BigNumber(initialBalance).minus(bidAmount);

        balance.should.be.bignumber.lt(expectedBalance);
        return scope;
      })
      // get all the bids for this project
      .then(projectManager.getBidsByName(projectArgs.name))
      .then(function(scope) {
        const bids = scope.result;
        console.log(bids);
        const acceptedBid = bids.filter(function (bid) {
          return bid.state === BidState[BidState.ACCEPTED];
        })[0];
        console.log(acceptedBid);
        return userManager.getBalanceAddress(acceptedBid.address)(scope);
      })
      .then(function(scope) {
        const balanceWei = scope.result; // in WEI
        const balance = new BigNumber(balanceWei).div(constants.ETHER);
        const bidAmount = new BigNumber(scope.acceptedBid.amount);
        balance.should.be.bignumber.equal(bidAmount);
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });



  it('Get projects by supplier', function(done) {
    const projectArgs = createProjectArgs(util.uid());
    const supplier = 'Supplier1';
    const amount = 5678;

    rest.setScope(scope)
      // create user
      .then(projectManager.createProject(adminName, projectArgs))
      .then(projectManager.createBid(adminName, projectArgs.name, supplier, amount))
      // get bids by supplier
      .then(projectManager.getProjectsBySupplier(supplier))
      .then(function(scope) {
        const projects = scope.result;
        const filtered = projects.filter(function(project) {
          return project.name === projectArgs.name;
        });
        assert.equal(filtered.length, 1, '# of found projects');
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });

  it('Send fund to project', function(done) {
    const uid = util.uid();
    const projectArgs = createProjectArgs(uid);
    const buyer = 'Buyer_' + uid;
    const supplier = 'Supplier_' + uid;
    const password = 'Pass_' + uid;
    const valueEther = 12;

    rest.setScope(scope)

    rest.setScope(scope)
    // create buyer/supplier
      .then(userManager.createUser(adminName, buyer, password, UserRole.BUYER))
      .then(userManager.createUser(adminName, supplier, password, UserRole.SUPPLIER))
      // create project
      .then(projectManager.createProject(adminName, projectArgs))

      // returns the record from search
      .then(projectManager.getProject(adminName, projectArgs.name))
      .then(function(scope) {
        scope.project = scope.result;
        return scope;
      })
      .then(userManager.getUser(adminName, buyer))
      .then(function(scope) {
        scope.buyer = scope.result;
        return scope;
      })
      .then(userManager.getUser(adminName, supplier))
      .then(function(scope) {
        scope.supplier = scope.result;
        return scope;
      })
      // send buyer-> contract
      .then(function(scope) {
        //{fromUser, password, fromAddress, toAddress, valueEther, node}
        const fromUser = scope.buyer.username;
        const fromAddress = scope.buyer.account;
        const toAddress = scope.project.address;
        return rest.sendAddress(fromUser, password, fromAddress, toAddress, valueEther)(scope);
      })
      .then(function(scope) {
        done();
      }).catch(done);
  });
});



// throws: ErrorCodes
function receiveProject(adminName, name, password) {
  return function(scope) {
    rest.verbose('receiveProject', name);
    return rest.setScope(scope)
      // get project
      .then(projectManager.getProject(adminName, name))
      // extract the buyer
      .then(function(scope) {
        const project = scope.result;
        scope.buyerName = project.buyer;
        return scope;
      })
      // get the buyer info
      .then(function(scope) {
        return userManager.getUser(adminName, scope.buyerName)(scope);
      })
      .then(function(scope) {
        scope.buyer = scope.result;
        return scope;
      })
      // get project bids
      .then(projectManager.getBidsByName(name))
      // extract the supplier out of the accepted bid
      .then(function(scope) {
        const bids = scope.result;
        // find the accepted bid
        const accepted = bids.filter(function(bid) {
          return bid.state == BidState[BidState.ACCEPTED];
        });
        if (accepted.length != 1) {
          throw(new Error(ErrorCodes.NOT_FOUND));
        }
        // supplier NAME
        scope.supplierName = accepted[0].supplier;
        scope.valueEther = accepted[0].amount;
        return scope;
      })
      // get the supplier info
      .then(function(scope) {
        return userManager.getUser(adminName, scope.supplierName)(scope)
      })
      .then(function(scope) {
        scope.supplier = scope.result;
        return scope;
      })
      // RECEIVE the project
      .then(projectManager.handleEvent(adminName, name, ProjectEvent.RECEIVE))
      // send the funds
      .then(function(scope) {
        //{fromUser, password, fromAddress, toAddress, valueEther, node}
        const fromUser = scope.buyer.username;
        const fromAddress = scope.buyer.account;
        const toAddress = scope.supplier.account;
        return rest.sendAddress(fromUser, password, fromAddress, toAddress, scope.valueEther)(scope);
      })
      .then(function(scope) {
        const txResult = scope.tx.slice(-1)[0].result;
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', txResult);
        return scope.result;
      })
  }
}
