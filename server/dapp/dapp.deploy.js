const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;
const util = common.util;
const fsutil = common.fsutil;
const should = common.should;
const assert = common.assert;
const expect = common.expect;
const Promise = common.Promise;

// ---------------------------------------------------
//   deploy the projects contracts
// ---------------------------------------------------

const dapp = require('./dapp')(config.libPath);
const AI = dapp.AI;
assert.isDefined(AI.subContractsNames['UserManager']);

const userManager = require(process.cwd() + '/' + config.libPath + '/user/userManager');

describe('Supply Chain Demo App - deploy contracts', function () {
  this.timeout(900 * 1000);

  const scope = {};
  const adminName = util.uid('Admin');  // FIXME
  const adminPassword = '1234';   // FIXME

  // uploading the admin contract and dependencies
  it('should upload the contracts', function (done) {
    dapp.setScope(scope)
    // compile search
      /////////////////.then(dapp.compileSearch())   FIXME what to do ?
      // set admin interface
      .then(dapp.setAdminInterface(adminName, adminPassword))
      // sanity check - get the freshly set admin interface
      .then(function (scope) {
        const address = scope.contracts[AI.contractName].address;
        scope.contracts[AI.contractName].string = 'removed to save screen space -LS';
        return dapp.getAdminInterface(address)(scope);
      })
      // create preset users
      .then(createPresetUsers(adminName))
      // write the deployment data to file
      .then(function (scope) {
        const object = {
          url: config.getBlocUrl(),
          adminName: adminName,
          adminPassword: adminPassword,
          AdminInterface: {
            address: scope.contracts[AI.contractName].address,
          },
        };
        console.log(config.deployFilename);
        console.log(fsutil.yamlSafeDumpSync(object));
        fsutil.yamlWrite(object, config.deployFilename);
        done();
      }).catch(done);
  });
});

const UserRole = rest.getEnums(`${config.libPath}/user/contracts/UserRole.sol`).UserRole;

const presetUsers = [
  {username: 'Supplier1', password: '1234', role: UserRole.SUPPLIER},
  {username: 'Supplier2', password: '1234', role: UserRole.SUPPLIER},
  {username: 'Buyer1', password: '1234', role: UserRole.BUYER},
  {username: 'Buyer2', password: '1234', role: UserRole.BUYER},
];

function createPresetUsers(adminName) {
  return function(scope) {
    return rest.setScope(scope)
      // add all users
      .then(function(scope) {
        return Promise.each(presetUsers, function(user) { // for each user
          const pwHash = util.toBytes32(user.password);
          return (userManager.createUser(adminName, user.username, pwHash, user.role)(scope)); // create user
        }).then(function() { // all done
          return scope;
        });
      })
      // query for all the users
      .then(userManager.getUsers())
      .then(function(scope) {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', scope.result);
        return scope;
      });
  }
}
