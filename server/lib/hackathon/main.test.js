require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;
const util = common.util;
const assert = common.assert;
const constants = common.constants;
const BigNumber = common.BigNumber;

const projectJs = require(`../project/project`);
const projectManagerJs = require(`../project/projectManager`);
const userManagerJs = require(`../user/userManager`);

const ErrorCodes = rest.getEnums(`${config.libPath}/common/ErrorCodes.sol`).ErrorCodes;
const ProjectState = rest.getEnums(`${config.libPath}/project/contracts/ProjectState.sol`).ProjectState;
const ProjectEvent = rest.getEnums(`${config.libPath}/project/contracts/ProjectEvent.sol`).ProjectEvent;
const BidState = rest.getEnums(`${config.libPath}/bid/contracts/BidState.sol`).BidState;
const UserRole = rest.getEnums(`${config.libPath}/user/contracts/UserRole.sol`).UserRole;

const adminName = util.uid('Admin');
const adminPassword = '1234';

/*

Running the test from the command line
    mocha server/lib/hackathon/main.test.js --config config/localhost.config.yaml --timeout=60000 -b

 */

describe('Hackathon Tests', function() {
    this.timeout(config.timeout);

    let admin;
    let contract;
    let userManagerContract;

    let projectList = {};
    // get ready:  admin-user and manager-contract

    before(function* () {
        admin = yield rest.createUser(adminName, adminPassword);
        contract = yield projectManagerJs.uploadContract(admin);
        userManagerContract = yield userManagerJs.uploadContract(admin);


        // if you want to create a project or two to be used in multiple tests
        /*
        projectList.project1 = yield contract.createProject( createProjectArgs(util.uid(),{
            name: 'Best Project',
            buyer: 'Buyer1',
            price: 100,
        }) );
        projectList.project2 = yield contract.createProject( createProjectArgs(util.uid(),{
            name: 'Even Better Project',
            buyer: 'Buyer2',
            price: 120,
        }) );

        //list all projects
        const projects = yield contract.getProjects();
        titledLog('PROJECTS', projects)
        */
    });

    it('Accept a Bid, rejects the others, receive project, settle (send bid funds to supplier)', function* () {
        const uid = util.uid();
        //creating project arguments w/ a unique uid is useful when searching database or when you want to fetch a project by name
        const projectArgs = createProjectArgs(uid);
        const password = '1234';
        const amount = 23;
        const numSuppliers = 3;

        // create buyer and suppliers
        const buyerArgs = createUserArgs(projectArgs.buyer, password, UserRole.BUYER);
        const buyer = yield userManagerContract.createUser(buyerArgs);
        buyer.password = password; //comment this line out and the test fails, find out why!
        titledLog('BUYER', buyer)

        // create suppliers
        const suppliers = yield createSuppliers(numSuppliers, password, uid, userManagerContract);

        // create a project
        const project = yield contract.createProject(projectArgs);
        titledLog('Project', project)

        // create bids
        const createdBids = yield createMultipleBids(projectArgs.name, suppliers, amount);
        titledLog('Created Bids', createdBids)

        { // test
            const bids = yield projectManagerJs.getBidsByName(projectArgs.name);
            assert.equal(createdBids.length, bids.length, 'should find all the created bids');
        }

        // accept one bid (the first)
        const acceptedBid = createdBids[0];
        yield contract.acceptBid(buyer, acceptedBid.id, projectArgs.name);

        // get the bids
        const bids = yield projectManagerJs.getBidsByName(projectArgs.name);
        titledLog('Bids', bids)

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

    });


    //Your company wants to track data not represented here. What are they tracking?
    it('Try, adding fields to a project, bid or user', function* (){

    })


    //How about new functions - what else would your company want to do w/ this data?
    it('Try, adding new functions to modify data in a project', function* (){

    })


    //Projects are easy to get by name, but what happens if two projects have the same name
    it('Try, getting project by address', function* (){

    })

    //If you create a new user role what else will you have to modify to integrate it with this system?
    it('Try, creating a new user role', function* (){

    })


    //generator/utility functions

    function* createMultipleBids(projectName, suppliers, amount) {
        const bids = [];
        for (let supplier of suppliers) {
            const bid = yield contract.createBid(projectName, supplier.username, amount);
            bids.push(bid);
        }
        return bids;
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

    function createProjectArgs(_uid, _args = {}) {
        const uid = _uid || util.uid();
        const projectArgs = Object.assign({
            name: 'P_ ?%#@!:* ' + uid.toString().substring(uid.length-5),
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
        },_args);

        return projectArgs;
    }



    function* createSuppliers(count, password, uid, userManagerContract) {
        const suppliers = [];
        for (let i = 0 ; i < count; i++) {
            const name = `Supplier${i}_${uid}`;
            const supplierArgs = createUserArgs(name, password, UserRole.SUPPLIER);
            const supplier = yield userManagerContract.createUser(supplierArgs);
            suppliers.push(supplier);
        }
        return suppliers;
    }

    // function createUser(address account, string username, bytes32 pwHash, UserRole role) returns (ErrorCodes) {
    function createUserArgs(name, password, role) {
        const args = {
            username: name,
            password: password,
            role: role,
        }
        return args;
    }

    function titledLog(title,content){
        console.log(' ')
        console.log(`===== ${title} =====`)
        console.log(content)
        console.log(`===== END ${title} =====`)
        console.log(' ')
    }

});

