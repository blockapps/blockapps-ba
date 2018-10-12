require('co-mocha');
const co = require('co');
const jwtDecode = require('jwt-decode');
const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;
const util = common.util;
const should = common.should;
const assert = common.assert;
const expect = common.expect;
const Promise = common.Promise;

//oauth changes
const accessToken = process.env['DEPLOY_ACCESS_TOKEN'];

// ---------------------------------------------------
//   deploy the projects contracts
// ---------------------------------------------------

const dappJs = require('./dapp');

describe('Supply Chain Demo App - deploy contracts', function () {
  this.timeout(900 * 1000);

  assert.isDefined(config.dataFilename, 'Data argument missing. Set in config, or use --data <path>');

  // const adminName = util.uid('Admin');  // FIXME
  // const adminPassword = '7890';   // FIXME

  // uploading the admin contract and dependencies

  // it('should upload the contracts', function* () {
  //   // get the dapp
  //   const admin = yield rest.createUser(adminName, adminPassword);
  //   // wait for the transaction to be added to blockchain
  //   do {
  //     yield new Promise(resolve => setTimeout(resolve, 1000))
  //   } while ((yield rest.getBalance(admin.address)) < 1);
  //   const dapp = yield dappJs.uploadContract(admin, config.libPath);
  //   const deployment = yield dapp.deploy(config.dataFilename, config.deployFilename);
  // });

  it('should upload the contracts', function* () {
    const decoded = jwtDecode(accessToken);
    const userEmail = decoded['email'];
    let address = null;

    try {
      const getKeyResponse = yield rest.getKey(accessToken);
      if (getKeyResponse && getKeyResponse.address) {
        address = getKeyResponse.address;
      }
    } catch (err) {
      if (err.status === 400) {
        try {
          const createKeyResponse = yield rest.createKey(accessToken);
          address = createKeyResponse.address;
          yield rest.fill({name: userEmail, address: address});
        } catch (err) {
          // return util.response.status500(res, 'Error Creating User Key or Faucet account');
        }
      } else {
        // return util.response.status500(res, 'Error Getting User Key');
      }
    }

    do {
      yield new Promise(resolve => setTimeout(resolve, 1000))
    } while ((yield rest.getBalance(address)) < 1);

    const dapp = yield dappJs.uploadContract(accessToken, config.libPath);
    const deployment = yield dapp.deploy(config.dataFilename, config.deployFilename);
  });

});
