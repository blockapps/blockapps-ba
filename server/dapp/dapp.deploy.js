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

const dappJs = require('./dapp')(config.libPath);

assert.isDefined(config.dataFilename, 'Data argument missing. Set in config, or use --data <path>');
const presetData = fsutil.yamlSafeLoadSync(config.dataFilename);
assert.isDefined(presetData, 'Demo data read failed');
assert.isDefined(presetData.users, 'Users data undefined');
console.log('Preset data', JSON.stringify(presetData, null, 2));

describe('Supply Chain Demo App - deploy contracts', function () {
  this.timeout(900 * 1000);

  const adminName = util.uid('Admin');  // FIXME
  const adminPassword = '1234';   // FIXME

  // uploading the admin contract and dependencies
  it('should upload the contracts', function* () {
    // get the dapp
    const admin = yield rest.createUser(adminName, adminPassword);
    const dapp = yield dappJs.uploadContract(admin);
    // create preset users
    yield dapp.createPresetUsers(presetData.users);   // TODO test the users are all in

    const object = {
      url: config.getBlocUrl(),
      admin: {
        name: adminName,
        password: adminPassword,
        address: admin.address,
      },
      AdminInterface: {
        address: dapp.aiAddress,
      },
      users: presetData.users,
    };
    console.log(config.deployFilename);
    console.log(fsutil.yamlSafeDumpSync(object));
    fsutil.yamlWrite(object, config.deployFilename);
  });
});
