require('co-mocha');
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

assert.isDefined(config.dataFilename, 'Data argument missing. Set in config, or use --data <path>');
const presetData = fsutil.yamlSafeLoadSync(config.dataFilename);
assert.isDefined(presetData, 'Demo data read failed');
assert.isDefined(presetData.users, 'Users data undefined');
console.log('Preset data', JSON.stringify(presetData, null, 2));

const userManager = require(process.cwd() + '/' + config.libPath + '/user/userManager');

describe('Supply Chain Demo App - deploy contracts', function () {
  this.timeout(900 * 1000);

  const adminName = util.uid('Admin');  // FIXME
  const adminPassword = '1234';   // FIXME

  // uploading the admin contract and dependencies
  it('should upload the contracts', function* () {
    // compile search
//    yield dapp.compileSearch();   911
    // set admin interface
    const admin = yield dapp.setAdminInterface(adminName, adminPassword);
    // sanity check - get the interface back
    const AI = yield dapp.getAdminInterface();
    // create preset users
    yield createPresetUsers(admin, AI.subContracts['UserManager'], presetData.users);
    const object = {
      url: config.getBlocUrl(),
      adminName: adminName,
      adminPassword: adminPassword,
      adminAddress: admin.address,
      AdminInterface: {
        address: AI.contract.address,
      },
      users: presetData.users,
    };
    console.log(config.deployFilename);
    console.log(fsutil.yamlSafeDumpSync(object));
    fsutil.yamlWrite(object, config.deployFilename);
  });
});

const UserRole = rest.getEnums(`${config.libPath}/user/contracts/UserRole.sol`).UserRole;

function* createPresetUsers(admin, contract, users) {
  for (let user of users) {
    const args = {
      username: user.username,
      password: user.password,
      role: UserRole[user.role],
    }
    const y = yield userManager.createUser(admin, contract, args);
  }
  // TODO test the users are all in
}
